import { core } from '../config/midtrans.js';
import { Transaction } from '../models/Transaction.js';
import { BalanceHistory } from '../models/Voucher.js';
import { User } from '../models/User.js';
import { Cart } from '../models/Cart.js';
import { Voucher } from '../models/Voucher.js';
import { ProductOrder } from '../models/Order.js';
import { CustomOrder } from '../models/CustomOrder.js';
import { CustomOrderPayment } from '../models/CustomOrderPayment.js';
import { Notification } from '../models/Settings.js';
import { verifyMidtransNotificationSignature } from '../utils/midtransSignature.js';
import { logger } from '../utils/logger.js';
import { chargeQris } from '../utils/midtransQris.js';

const MIN_TOPUP = 10_000;

const mapMidtransToDbStatus = (transactionStatus) => {
  const s = String(transactionStatus || '').toLowerCase();
  if (s === 'settlement' || s === 'capture') return 'success';
  if (s === 'pending') return 'pending';
  if (s === 'expire' || s === 'cancel' || s === 'deny' || s === 'failure') return 'failed';
  return 'failed';
};

function parseVoucherIdFromNotes(notes) {
  if (!notes || typeof notes !== 'string') return null;
  const m = notes.match(/voucher_id:(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

export const midtransController = {
  callback: async (req, res) => {
    const notification = req.body || {};
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (process.env.NODE_ENV === 'production') {
      if (!serverKey) {
        logger.error('MIDTRANS_SERVER_KEY missing for callback');
        return res.status(500).json({ success: false, message: 'Server misconfigured' });
      }
      if (!verifyMidtransNotificationSignature(notification, serverKey)) {
        return res.status(403).json({ success: false, message: 'Invalid signature' });
      }
    } else if (serverKey && notification.signature_key) {
      if (!verifyMidtransNotificationSignature(notification, serverKey)) {
        logger.warn('Midtrans signature mismatch (dev)');
        return res.status(403).json({ success: false, message: 'Invalid signature' });
      }
    }

    const orderId = notification.order_id != null ? String(notification.order_id) : '';

    try {
      let transactionStatus;
      try {
        transactionStatus = await core.transaction.status(orderId);
      } catch (e) {
        logger.warn('Midtrans status API failed, using notification body', e?.message);
        transactionStatus = {
          transaction_status: notification.transaction_status,
          transaction_id: notification.transaction_id,
          status_message: notification.status_message,
          gross_amount: notification.gross_amount,
        };
      }

      const rawStatus = transactionStatus.transaction_status || notification.transaction_status;
      const statusToUpdate = mapMidtransToDbStatus(rawStatus);

      if (orderId.startsWith('CO-')) {
        const orderNumber = orderId.replace(/^CO-/, '');
        const customOrder = await CustomOrder.findByOrderNumber(orderNumber);
        if (!customOrder) {
          return res.status(404).json({ success: false, message: 'Custom order not found' });
        }

        let payment = await CustomOrderPayment.findByMidtransOrderId(orderId);
        if (!payment) {
          payment = await CustomOrderPayment.create({
            custom_order_id: customOrder.id,
            amount: parseFloat(notification.gross_amount || customOrder.budget || 0),
            status: 'pending',
            midtrans_order_id: orderId,
          });
        }

        const paymentRowStatus =
          statusToUpdate === 'success' ? 'success' : statusToUpdate === 'pending' ? 'pending' : 'failed';
        await CustomOrderPayment.update(payment.id, { status: paymentRowStatus });

        if (statusToUpdate === 'success') {
          await CustomOrder.update(customOrder.id, {
            payment_status: 'completed',
            status: 'processing',
          });
        } else if (statusToUpdate === 'failed') {
          await CustomOrder.update(customOrder.id, {
            payment_status: 'failed',
          });
        }

        return res.json({ success: true, message: 'Custom order payment processed' });
      }

      const transaction = await Transaction.findByOrderId(orderId);
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      const wasSuccess = String(transaction.status).toLowerCase() === 'success';

      await Transaction.update(transaction.id, {
        status: statusToUpdate,
        midtrans_transaction_id: transactionStatus.transaction_id || notification.transaction_id || null,
        notes: transactionStatus.status_message || notification.status_message || transaction.notes || null,
      });

      const pm = String(transaction.payment_method || '');
      const grossAmt = parseFloat(transaction.final_amount ?? transaction.gross_amount);

      if (statusToUpdate === 'success' && !wasSuccess) {
        if (pm === 'topup') {
          const user = await User.findById(transaction.user_id);
          const balanceBefore = Number(user?.balance ?? 0);
          await User.updateBalance(transaction.user_id, grossAmt);
          await BalanceHistory.create({
            user_id: transaction.user_id,
            type: 'topup',
            amount: grossAmt,
            description: `Topup via Midtrans order ${transaction.order_id}`,
            balance_before: balanceBefore,
            balance_after: balanceBefore + grossAmt,
            reference_id: transaction.id,
          });
          await Notification.create({
            user_id: transaction.user_id,
            type: 'topup_success',
            level: 'success',
            title: 'Top up berhasil',
            message: `Saldo Anda bertambah sebesar Rp ${grossAmt.toLocaleString('id-ID')} (order ${transaction.order_id}).`,
            related_id: transaction.id,
          }).catch((e) => logger.warn('Notify topup success', e?.message));
        }

        if (pm === 'midtrans_qris' || pm === 'midtrans') {
          await ProductOrder.updateStatusByTransactionId(transaction.id, 'paid');
          await Cart.clearCart(transaction.user_id);

          const voucherId = parseVoucherIdFromNotes(transaction.notes);
          if (voucherId) {
            await Voucher.incrementUsage(voucherId).catch((err) =>
              logger.warn('Voucher increment failed', err?.message)
            );
          }
          await Notification.create({
            user_id: transaction.user_id,
            type: 'purchase_success',
            level: 'success',
            title: 'Pembayaran berhasil',
            message: `Pembelian dengan order ${transaction.order_id} telah dikonfirmasi.`,
            related_id: transaction.id,
          }).catch((e) => logger.warn('Notify purchase success', e?.message));
        }
      } else if (statusToUpdate === 'failed' && !wasSuccess) {
        const isTopup = pm === 'topup';
        await Notification.create({
          user_id: transaction.user_id,
          type: isTopup ? 'topup_failed' : 'purchase_failed',
          level: 'error',
          title: isTopup ? 'Top up gagal' : 'Pembayaran gagal',
          message: `Transaksi ${transaction.order_id} tidak berhasil, dibatalkan, atau kedaluwarsa.`,
          related_id: transaction.id,
        }).catch((e) => logger.warn('Notify payment failed', e?.message));
      }

      return res.json({
        success: true,
        message: 'Callback processed',
        data: { order_id: orderId, status: statusToUpdate },
      });
    } catch (error) {
      logger.error('Midtrans callback error:', error);
      return res.status(500).json({
        success: false,
        message: 'Callback processing failed',
      });
    }
  },

  topup: async (req, res) => {
    try {
      const amountNum = Number(req.body?.amount);
      if (!Number.isFinite(amountNum) || amountNum < MIN_TOPUP) {
        return res.status(400).json({
          success: false,
          message: `Nominal minimal ${MIN_TOPUP.toLocaleString('id-ID')} IDR`,
        });
      }

      if (!process.env.MIDTRANS_SERVER_KEY) {
        return res.status(503).json({
          success: false,
          message: 'Pembayaran belum dikonfigurasi (MIDTRANS_SERVER_KEY)',
        });
      }

      const user = await User.findById(req.user.id);

      const orderId = `TOPUP-${Date.now()}`;
      const acquirer = process.env.MIDTRANS_QRIS_ACQUIRER || 'gopay';

      const charged = await chargeQris({
        orderId,
        grossAmount: amountNum,
        customerDetails: {
          email: user.email,
          first_name: user.name || 'Customer',
          phone: user.phone || '08123456789',
        },
        acquirer,
      });

      const transaction = await Transaction.create({
        user_id: req.user.id,
        order_id: orderId,
        gross_amount: amountNum,
        final_amount: amountNum,
        payment_method: 'topup',
        midtrans_snap_token: null,
        midtrans_transaction_id: charged.transaction_id,
        status: 'pending',
        notes: null,
      });

      return res.json({
        success: true,
        message: 'QRIS siap — scan untuk menyelesaikan pembayaran',
        data: {
          transaction_id: transaction.id,
          order_id: orderId,
          qr_string: charged.qr_string,
          expiry_time: charged.expiry_time,
          midtrans_transaction_id: charged.transaction_id,
          amount: amountNum,
          acquirer,
        },
      });
    } catch (error) {
      logger.error('Topup error:', error);
      return res.status(500).json({
        success: false,
        message: error?.message || 'Gagal membuat pembayaran topup',
      });
    }
  },

  getStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      return res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      logger.error('Get payment status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
      });
    }
  },
};
