import { core, snap } from '../config/midtrans.js';
import { Transaction } from '../models/Transaction.js';
import { BalanceHistory } from '../models/Voucher.js';
import { User } from '../models/User.js';

const mapMidtransStatus = (status) => {
  if (status === 'settlement' || status === 'capture') {
    return 'success';
  }
  if (status === 'pending') {
    return 'pending';
  }
  if (status === 'cancel' || status === 'deny') {
    return 'canceled';
  }
  if (status === 'expire') {
    return 'expired';
  }
  return 'failed';
};

export const midtransController = {
  callback: async (req, res) => {
    try {
      const notification = req.body;
      const transactionStatus = await core.transaction.status(notification.order_id);
      const transaction = await Transaction.findByOrderId(notification.order_id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      const statusToUpdate = mapMidtransStatus(transactionStatus.transaction_status);

      const updatedTransaction = await Transaction.update(transaction.id, {
        status: statusToUpdate,
        midtrans_transaction_id: transactionStatus.transaction_id,
        notes: transactionStatus.status_message || notification.status_message || null,
      });

      if (statusToUpdate === 'success' && transaction.status !== 'success') {
        if (transaction.payment_method === 'topup') {
          const user = await User.findById(transaction.user_id);
          const balanceBefore = user.balance;
          await User.updateBalance(transaction.user_id, parseFloat(transaction.gross_amount));
          await BalanceHistory.create({
            user_id: transaction.user_id,
            type: 'topup',
            amount: parseFloat(transaction.gross_amount),
            description: `Topup via Midtrans order ${transaction.order_id}`,
            balance_before: balanceBefore,
            balance_after: balanceBefore + parseFloat(transaction.gross_amount),
            reference_id: transaction.id,
          });
        }
      }

      res.json({
        success: true,
        message: 'Callback processed successfully',
        data: updatedTransaction,
      });
    } catch (error) {
      console.error('Midtrans callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Callback processing failed',
      });
    }
  },

  topup: async (req, res) => {
    try {
      const { amount } = req.body;
      const user = await User.findById(req.user.id);

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than zero',
        });
      }

      const orderId = `TOPUP-${Date.now()}`;
      const transactionDetails = {
        transaction_details: {
          order_id: orderId,
          gross_amount: Math.round(amount),
        },
        customer_details: {
          email: user.email,
          first_name: user.name,
          phone: user.phone,
        },
        payment_type: 'qris',
      };

      const snapResponse = await snap.createTransaction(transactionDetails);
      const snapToken = snapResponse.token;

      const transaction = await Transaction.create({
        user_id: req.user.id,
        order_id: orderId,
        gross_amount: parseFloat(amount),
        final_amount: parseFloat(amount),
        payment_method: 'topup',
        midtrans_snap_token: snapToken,
        status: 'pending',
      });

      res.json({
        success: true,
        message: 'Topup token generated',
        data: {
          transaction_id: transaction.id,
          order_id: orderId,
          snap_token: snapToken,
          redirect_url: snapResponse.redirect_url,
          amount: parseFloat(amount),
        },
      });
    } catch (error) {
      console.error('Topup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate topup token',
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

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
      });
    }
  },
};
