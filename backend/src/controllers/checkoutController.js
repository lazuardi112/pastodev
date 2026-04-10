import path from 'path';
import { Cart, Review } from '../models/Cart.js';
import { Transaction, TransactionItem } from '../models/Transaction.js';
import { Voucher, BalanceHistory } from '../models/Voucher.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ProductOrder } from '../models/Order.js';
import { chargeQris } from '../utils/midtransQris.js';
import { generateOrderId, calculateDiscount } from '../utils/helpers.js';

export const cartController = {
  getItems: async (req, res) => {
    try {
      const items = await Cart.getItems(req.user.id);
      const itemCount = await Cart.getItemCount(req.user.id);

      res.json({
        success: true,
        data: items,
        itemCount,
      });
    } catch (error) {
      console.error('Get cart items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cart items',
      });
    }
  },

  addItem: async (req, res) => {
    try {
      const { product_id, quantity = 1 } = req.body;

      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const cartItem = await Cart.addItem(req.user.id, product_id, quantity);

      res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: cartItem,
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart',
      });
    }
  },

  updateQuantity: async (req, res) => {
    try {
      const { cartId } = req.params;
      const { quantity } = req.body;

      const item = await Cart.updateQuantity(cartId, quantity);

      res.json({
        success: true,
        message: quantity === 0 ? 'Item removed from cart' : 'Quantity updated',
        data: item,
      });
    } catch (error) {
      console.error('Update quantity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quantity',
      });
    }
  },

  removeItem: async (req, res) => {
    try {
      const { cartId } = req.params;
      await Cart.removeItem(cartId);

      res.json({
        success: true,
        message: 'Item removed from cart',
      });
    } catch (error) {
      console.error('Remove item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove item',
      });
    }
  },

  clearCart: async (req, res) => {
    try {
      await Cart.clearCart(req.user.id);

      res.json({
        success: true,
        message: 'Cart cleared',
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
      });
    }
  },
};

export const checkoutController = {
  checkout: async (req, res) => {
    try {
      const { payment_method, voucher_code } = req.body;

      // Get cart items
      const cartItems = await Cart.getItems(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty',
        });
      }

      const originalTotal = cartItems.reduce((sum, item) => {
        return sum + Number(item.price) * Number(item.quantity);
      }, 0);

      let discount = 0;
      let voucherId = null;
      let finalAmount = originalTotal;
      let notes = null;

      if (voucher_code) {
        const voucher = await Voucher.findByCode(voucher_code);
        if (voucher) {
          if (originalTotal >= (voucher.min_purchase ?? 0)) {
            discount = calculateDiscount(
              originalTotal,
              voucher.discount_type,
              voucher.discount_value,
              voucher.max_discount
            );
            voucherId = voucher.id;
            finalAmount = originalTotal - discount;
            notes = `voucher_id:${voucher.id}`;
          }
        }
      }

      if (payment_method === 'balance') {
        const user = await User.findById(req.user.id);
        const bal = Number(user?.balance ?? 0);
        if (!Number.isFinite(bal) || bal < finalAmount) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient balance',
          });
        }

        const orderId = generateOrderId();
        const transaction = await Transaction.create({
          user_id: req.user.id,
          order_id: orderId,
          gross_amount: originalTotal,
          discount_amount: discount,
          final_amount: finalAmount,
          payment_method: 'balance',
          status: 'success',
          notes,
        });

        for (const item of cartItems) {
          const line = Number(item.price) * Number(item.quantity);
          await TransactionItem.create({
            transaction_id: transaction.id,
            product_id: item.product_id,
            product_name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            subtotal: line,
          });
          await ProductOrder.create({
            user_id: req.user.id,
            product_id: item.product_id,
            quantity: Number(item.quantity),
            amount: line,
            status: 'paid',
            transaction_id: transaction.id,
            midtrans_order_id: orderId,
          });
        }

        const balanceBefore = bal;
        await User.updateBalance(req.user.id, -finalAmount);

        await BalanceHistory.create({
          user_id: req.user.id,
          type: 'purchase',
          amount: -finalAmount,
          description: `Purchase with order ID ${orderId}`,
          balance_before: balanceBefore,
          balance_after: balanceBefore - finalAmount,
          reference_id: transaction.id,
        });

        if (voucherId) {
          await Voucher.incrementUsage(voucherId);
        }

        await Cart.clearCart(req.user.id);

        return res.status(201).json({
          success: true,
          message: 'Payment successful',
          data: {
            transaction_id: transaction.id,
            order_id: orderId,
            amount: finalAmount,
            payment_method: 'balance',
            redirect_rating: `/rating?transaction_id=${transaction.id}`,
          },
        });
      } else if (payment_method === 'midtrans_qris') {
        const orderId = generateOrderId();
        const user = await User.findById(req.user.id);
        const acquirer = process.env.MIDTRANS_QRIS_ACQUIRER || 'gopay';

        const itemDetails = cartItems.map((item) => ({
          id: String(item.product_id),
          price: Math.round(Number(item.price)),
          quantity: Number(item.quantity),
          name: String(item.name || 'Produk').slice(0, 50),
        }));

        const charged = await chargeQris({
          orderId,
          grossAmount: Math.round(finalAmount),
          customerDetails: {
            email: user.email,
            first_name: user.name || 'Customer',
            phone: user.phone || '08123456789',
          },
          itemDetails,
          acquirer,
        });

        const transaction = await Transaction.create({
          user_id: req.user.id,
          order_id: orderId,
          gross_amount: originalTotal,
          discount_amount: discount,
          final_amount: finalAmount,
          payment_method: 'midtrans_qris',
          midtrans_snap_token: null,
          midtrans_transaction_id: charged.transaction_id,
          status: 'pending',
          notes,
        });

        for (const item of cartItems) {
          const line = Number(item.price) * Number(item.quantity);
          await TransactionItem.create({
            transaction_id: transaction.id,
            product_id: item.product_id,
            product_name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            subtotal: line,
          });
          await ProductOrder.create({
            user_id: req.user.id,
            product_id: item.product_id,
            quantity: Number(item.quantity),
            amount: line,
            status: 'pending',
            transaction_id: transaction.id,
            midtrans_order_id: orderId,
          });
        }

        return res.status(201).json({
          success: true,
          message: 'QRIS dibuat — scan untuk membayar',
          data: {
            transaction_id: transaction.id,
            order_id: orderId,
            qr_string: charged.qr_string,
            expiry_time: charged.expiry_time,
            midtrans_transaction_id: charged.transaction_id,
            amount: finalAmount,
            acquirer,
          },
        });
      }

      res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({
        success: false,
        message: 'Checkout failed',
      });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const transactions = await Transaction.getByUserId(
        req.user.id,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
      });
    }
  },

  getTransactionDetail: async (req, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await Transaction.findById(transactionId);

      if (!transaction || transaction.user_id !== req.user.id) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      const items = await TransactionItem.getByTransactionId(transactionId);

      res.json({
        success: true,
        data: {
          ...transaction,
          items,
        },
      });
    } catch (error) {
      console.error('Get transaction detail error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction detail',
      });
    }
  },

  downloadProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const transactionId = req.query.transactionId ?? req.body?.transactionId;
      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Parameter transactionId wajib diisi',
        });
      }

      const transaction = await Transaction.findById(transactionId);
      if (!transaction || Number(transaction.user_id) !== Number(req.user.id) || transaction.status !== 'success') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const items = await TransactionItem.getByTransactionId(transactionId);
      const ownsProduct = items.some((i) => String(i.product_id) === String(productId));
      if (!ownsProduct) {
        return res.status(403).json({
          success: false,
          message: 'Produk tidak termasuk transaksi ini',
        });
      }

      const product = await Product.findById(productId);
      if (!product || !product.file_url) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, product.file_url.split('/').pop());
      res.download(filePath, product.name);
    } catch (error) {
      console.error('Download product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download product',
      });
    }
  },
};
