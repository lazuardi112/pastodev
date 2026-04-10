import { Transaction, TransactionItem } from '../models/Transaction.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ProductOrder } from '../models/Order.js';
import { chargeQris } from '../utils/midtransQris.js';
import { generateOrderId } from '../utils/helpers.js';

export const ordersController = {
  /** Direct buy satu produk — Snap QRIS */
  create: async (req, res) => {
    try {
      const productId = parseInt(req.body?.product_id, 10);
      const quantity = Math.max(1, parseInt(req.body?.quantity ?? 1, 10) || 1);

      if (!productId) {
        return res.status(400).json({ success: false, message: 'product_id wajib diisi' });
      }

      if (!process.env.MIDTRANS_SERVER_KEY) {
        return res.status(503).json({
          success: false,
          message: 'Pembayaran belum dikonfigurasi (MIDTRANS_SERVER_KEY)',
        });
      }

      const product = await Product.findById(productId);
      if (!product || !product.is_active) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      const unit = Number(product.discount_price ?? product.price);
      const lineTotal = unit * quantity;
      const user = await User.findById(req.user.id);

      const orderId = generateOrderId();
      const acquirer = process.env.MIDTRANS_QRIS_ACQUIRER || 'gopay';

      const charged = await chargeQris({
        orderId,
        grossAmount: Math.round(lineTotal),
        customerDetails: {
          email: user.email,
          first_name: user.name || 'Customer',
          phone: user.phone || '08123456789',
        },
        itemDetails: [
          {
            id: String(product.id),
            price: Math.round(unit),
            quantity,
            name: product.name?.slice(0, 50) || 'Product',
          },
        ],
        acquirer,
      });

      const transaction = await Transaction.create({
        user_id: req.user.id,
        order_id: orderId,
        gross_amount: lineTotal,
        discount_amount: 0,
        final_amount: lineTotal,
        payment_method: 'midtrans_qris',
        midtrans_snap_token: null,
        midtrans_transaction_id: charged.transaction_id,
        status: 'pending',
        notes: null,
      });

      await TransactionItem.create({
        transaction_id: transaction.id,
        product_id: product.id,
        product_name: product.name,
        price: unit,
        quantity,
        subtotal: lineTotal,
      });

      await ProductOrder.create({
        user_id: req.user.id,
        product_id: product.id,
        quantity,
        amount: lineTotal,
        status: 'pending',
        transaction_id: transaction.id,
        midtrans_order_id: orderId,
      });

      return res.status(201).json({
        success: true,
        message: 'Transaksi dibuat',
        data: {
          transaction_id: transaction.id,
          order_id: orderId,
          qr_string: charged.qr_string,
          expiry_time: charged.expiry_time,
          midtrans_transaction_id: charged.transaction_id,
          amount: lineTotal,
          acquirer,
        },
      });
    } catch (error) {
      console.error('Create order error:', error);
      return res.status(500).json({
        success: false,
        message: error?.message || 'Gagal membuat pesanan',
      });
    }
  },

  listMine: async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const orders = await ProductOrder.getByUserId(
        req.user.id,
        parseInt(limit, 10),
        parseInt(offset, 10)
      );
      return res.json({ success: true, data: orders });
    } catch (error) {
      console.error('List user orders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil pesanan',
      });
    }
  },
};
