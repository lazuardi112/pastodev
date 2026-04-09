import { Transaction } from '../models/Transaction.js';
import { Voucher, BalanceHistory } from '../models/Voucher.js';
import { User } from '../models/User.js';
import { CustomOrder, CustomOrderMessage } from '../models/CustomOrder.js';
import { Settings, Notification } from '../models/Settings.js';
import { generateCustomOrderNumber } from '../utils/helpers.js';
import { snap } from '../config/midtrans.js';

export const adminController = {
  getDashboardStats: async (req, res) => {
    try {
      const userCount = await User.count();
      const stats = await Transaction.getStatistics();

      res.json({
        success: true,
        data: {
          total_users: userCount,
          total_transactions: stats.total_transactions,
          success_transactions: stats.success_count,
          total_revenue: stats.total_revenue || 0,
          average_transaction: stats.avg_transaction || 0,
        },
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik dashboard',
      });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const transactions = await Transaction.getAll(parseInt(limit), parseInt(offset));

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil transaksi',
      });
    }
  },

  updateTransactionStatus: async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { status } = req.body;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan',
        });
      }

      const updated = await Transaction.update(transactionId, { status });

      res.json({
        success: true,
        message: 'Status transaksi berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      console.error('Update transaction status error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui status transaksi',
      });
    }
  },

  getUsers: async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const users = await User.getAll(parseInt(limit), parseInt(offset));

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data pengguna',
      });
    }
  },

  toggleBlockUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }

      const updatedUser = await User.toggleBlock(userId);

      // Create notification
      const action = updatedUser.is_blocked ? 'diblokir' : 'dibuka blokir';
      await Notification.create({
        user_id: userId,
        type: 'account_status',
        title: 'Status Akun Berubah',
        message: `Akun Anda telah ${action} oleh admin`,
        related_id: userId,
      });

      res.json({
        success: true,
        message: `Pengguna ${action} berhasil`,
        data: updatedUser,
      });
    } catch (error) {
      console.error('Toggle block user error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memblokir pengguna',
      });
    }
  },

  addUserBalance: async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, reason } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah harus lebih besar dari 0',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }

      const updatedUser = await User.adminAddBalance(
        userId,
        parseFloat(amount),
        'admin_deposit',
        reason || 'Deposit dari admin'
      );

      // Create notification
      await Notification.create({
        user_id: userId,
        type: 'balance_change',
        title: 'Saldo Ditambahkan',
        message: `Saldo Anda bertambah Rp ${amount.toLocaleString('id-ID')}`,
        related_id: userId,
      });

      res.json({
        success: true,
        message: 'Saldo pengguna berhasil ditambahkan',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Add user balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan saldo pengguna',
      });
    }
  },

  subtractUserBalance: async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, reason } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah harus lebih besar dari 0',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }

      if (user.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Saldo pengguna tidak cukup',
        });
      }

      const updatedUser = await User.adminAddBalance(
        userId,
        -parseFloat(amount),
        'admin_withdrawal',
        reason || 'Penarikan dari admin'
      );

      // Create notification
      await Notification.create({
        user_id: userId,
        type: 'balance_change',
        title: 'Saldo Dikurangi',
        message: `Saldo Anda berkurang Rp ${amount.toLocaleString('id-ID')}`,
        related_id: userId,
      });

      res.json({
        success: true,
        message: 'Saldo pengguna berhasil dikurangi',
        data: updatedUser,
      });
    } catch (error) {
      console.error('Subtract user balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengurangi saldo pengguna',
      });
    }
  },

  getUserDetail: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }

      const transactions = await Transaction.getByUserId(userId, 10, 0);
      const balanceHistory = await BalanceHistory.getByUserId(userId, 20, 0);

      res.json({
        success: true,
        data: {
          user,
          recent_transactions: transactions,
          balance_history: balanceHistory,
        },
      });
    } catch (error) {
      console.error('Get user detail error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail pengguna',
      });
    }
  },
};

export const voucherController = {
  create: async (req, res) => {
    try {
      const data = req.body;
      const voucher = await Voucher.create(data);

      res.status(201).json({
        success: true,
        message: 'Voucher berhasil dibuat',
        data: voucher,
      });
    } catch (error) {
      console.error('Create voucher error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat voucher',
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const vouchers = await Voucher.getAll(parseInt(limit), parseInt(offset));

      res.json({
        success: true,
        data: vouchers,
      });
    } catch (error) {
      console.error('Get vouchers error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil voucher',
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const voucher = await Voucher.update(id, data);

      res.json({
        success: true,
        message: 'Voucher berhasil diperbarui',
        data: voucher,
      });
    } catch (error) {
      console.error('Update voucher error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui voucher',
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await Voucher.delete(id);

      res.json({
        success: true,
        message: 'Voucher berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete voucher error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus voucher',
      });
    }
  },
};

export const customOrderController = {
  create: async (req, res) => {
    try {
      const { title, description, budget } = req.body;
      const orderNumber = generateCustomOrderNumber();

      const customOrder = await CustomOrder.create({
        user_id: req.user.id,
        order_number: orderNumber,
        title,
        description,
        budget: parseFloat(budget),
      });

      res.status(201).json({
        success: true,
        message: 'Custom order berhasil dibuat',
        data: customOrder,
      });
    } catch (error) {
      console.error('Create custom order error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat custom order',
      });
    }
  },

  getMyOrders: async (req, res) => {
    try {
      const { limit = 20, offset = 0, status } = req.query;
      let orders = await CustomOrder.getByUserId(
        req.user.id,
        parseInt(limit),
        parseInt(offset)
      );

      if (status) {
        orders = orders.filter((o) => o.status === status);
      }

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error('Get my custom orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil custom order',
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const { limit = 20, offset = 0, status } = req.query;
      let orders = await CustomOrder.getAll(parseInt(limit), parseInt(offset));

      if (status) {
        orders = orders.filter((o) => o.status === status);
      }

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error('Get all custom orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil custom order',
      });
    }
  },

  getDetail: async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await CustomOrder.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Custom order tidak ditemukan',
        });
      }

      if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak',
        });
      }

      const messages = await CustomOrderMessage.getByOrderId(orderId);

      res.json({
        success: true,
        data: {
          ...order,
          messages,
        },
      });
    } catch (error) {
      console.error('Get custom order detail error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail custom order',
      });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, admin_notes, result_file_url } = req.body;

      const customOrder = await CustomOrder.findById(orderId);
      if (!customOrder) {
        return res.status(404).json({
          success: false,
          message: 'Custom order tidak ditemukan',
        });
      }

      const updatedOrder = await CustomOrder.update(orderId, {
        status,
        admin_notes,
        result_file_url,
      });

      // Create notification for status change
      let notificationTitle = 'Update Custom Order';
      let notificationMessage = `Status custom order ${customOrder.order_number} berubah menjadi ${status}`;

      if (status === 'diterima') {
        notificationTitle = 'Custom Order Diterima';
        notificationMessage = `Custom order Anda dengan nomor ${customOrder.order_number} telah diterima oleh admin`;
      } else if (status === 'ditolak') {
        notificationTitle = 'Custom Order Ditolak';
        notificationMessage = `Custom order Anda dengan nomor ${customOrder.order_number} telah ditolak`;
      } else if (status === 'proses') {
        notificationTitle = 'Custom Order Sedang Diproses';
        notificationMessage = `Custom order Anda dengan nomor ${customOrder.order_number} sedang diproses`;
      } else if (status === 'selesai') {
        notificationTitle = 'Custom Order Selesai';
        notificationMessage = `Custom order Anda dengan nomor ${customOrder.order_number} telah selesai`;
      }

      await Notification.create({
        user_id: customOrder.user_id,
        type: 'custom_order_status',
        title: notificationTitle,
        message: notificationMessage,
        related_id: orderId,
      });

      res.json({
        success: true,
        message: 'Status custom order berhasil diperbarui',
        data: updatedOrder,
      });
    } catch (error) {
      console.error('Update custom order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui custom order',
      });
    }
  },

  generatePaymentLink: async (req, res) => {
    try {
      const { orderId } = req.params;

      const customOrder = await CustomOrder.findById(orderId);
      if (!customOrder) {
        return res.status(404).json({
          success: false,
          message: 'Custom order tidak ditemukan',
        });
      }

      if (customOrder.payment_status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Pembayaran custom order sudah selesai',
        });
      }

      const user = await User.findById(customOrder.user_id);

      const parameter = {
        transaction_details: {
          order_id: `CO-${customOrder.order_number}`,
          gross_amount: Math.round(customOrder.budget),
        },
        customer_details: {
          first_name: user.name,
          email: user.email,
          phone: user.phone,
        },
      };

      const transaction = await snap.createTransaction(parameter);

      // Update custom order with payment link
      const updatedOrder = await CustomOrder.update(orderId, {
        payment_link: transaction.redirect_url,
        payment_status: 'pending',
      });

      res.json({
        success: true,
        message: 'Link pembayaran berhasil dibuat',
        data: {
          payment_link: transaction.redirect_url,
          token: transaction.token,
          order: updatedOrder,
        },
      });
    } catch (error) {
      console.error('Generate payment link error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat link pembayaran',
      });
    }
  },

  addMessage: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { message } = req.body;
      const file = req.file;

      const order = await CustomOrder.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Custom order tidak ditemukan',
        });
      }

      if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak',
        });
      }

      const file_url = file ? `/uploads/${file.filename}` : null;

      const newMessage = await CustomOrderMessage.create({
        custom_order_id: orderId,
        user_id: req.user.id,
        message,
        file_url,
      });

      // Create notification for new message
      const recipientId =
        req.user.id === order.user_id
          ? order.user_id
          : order.user_id;

      if (req.user.role === 'admin') {
        await Notification.create({
          user_id: order.user_id,
          type: 'custom_order_message',
          title: 'Pesan Baru dari Admin',
          message: `Admin mengirim pesan pada custom order ${order.order_number}`,
          related_id: orderId,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Pesan berhasil ditambahkan',
        data: newMessage,
      });
    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan pesan',
      });
    }
  },
};
