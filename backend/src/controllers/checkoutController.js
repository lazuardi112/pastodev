import { Cart, Review } from '../models/Cart.js';
import { Transaction, TransactionItem } from '../models/Transaction.js';
import { Voucher, BalanceHistory } from '../models/Voucher.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { snap } from '../config/midtrans.js';
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
        return sum + item.price * item.quantity;
      }, 0);

      let discount = 0;
      let voucherId = null;
      let finalAmount = originalTotal;

      if (voucher_code) {
        const voucher = await Voucher.findByCode(voucher_code);
        if (voucher) {
          if (originalTotal >= voucher.min_purchase) {
            discount = calculateDiscount(
              originalTotal,
              voucher.discount_type,
              voucher.discount_value,
              voucher.max_discount
            );
            voucherId = voucher.id;
            finalAmount = originalTotal - discount;
          }
        }
      }

      if (payment_method === 'balance') {
        const user = await User.findById(req.user.id);
        if (user.balance < finalAmount) {
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
        });

        for (const item of cartItems) {
          await TransactionItem.create({
            transaction_id: transaction.id,
            product_id: item.product_id,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          });
        }

        const balanceBefore = user.balance;
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
          },
        });
      } else if (payment_method === 'midtrans_qris') {
        const orderId = generateOrderId();
        const user = await User.findById(req.user.id);

        const transactionDetails = {
          transaction_details: {
            order_id: orderId,
            gross_amount: Math.round(finalAmount),
          },
          customer_details: {
            email: user.email,
            first_name: user.name,
            phone: user.phone,
          },
          payment_type: 'qris',
        };

        const snapToken = await snap.createTransactionToken(transactionDetails);
        const transaction = await Transaction.create({
          user_id: req.user.id,
          order_id: orderId,
          gross_amount: originalTotal,
          discount_amount: discount,
          final_amount: finalAmount,
          payment_method: 'midtrans_qris',
          midtrans_snap_token: snapToken,
          status: 'pending',
        });

        for (const item of cartItems) {
          await TransactionItem.create({
            transaction_id: transaction.id,
            product_id: item.product_id,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          });
        }

        return res.status(201).json({
          success: true,
          message: 'Payment token generated',
          data: {
            transaction_id: transaction.id,
            order_id: orderId,
            snap_token: snapToken,
            amount: finalAmount,
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

      // Check if user has purchased this product
      const transaction = await Transaction.findById(req.body.transactionId);
      if (!transaction || transaction.user_id !== req.user.id || transaction.status !== 'success') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const product = await Product.findById(productId);
      if (!product || !product.file_url) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Serve the file
      const filePath = `${process.env.UPLOAD_DIR || './uploads'}/${product.file_url.split('/').pop()}`;
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
