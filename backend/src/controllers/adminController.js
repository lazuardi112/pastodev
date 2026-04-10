import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Transaction } from '../models/Transaction.js';
import { Voucher, BalanceHistory } from '../models/Voucher.js';
import { User } from '../models/User.js';
import { CustomOrder, CustomOrderMessage } from '../models/CustomOrder.js';
import { CustomOrderPayment } from '../models/CustomOrderPayment.js';
import { Settings, Notification } from '../models/Settings.js';
import { generateCustomOrderNumber } from '../utils/helpers.js';
import { snap } from '../config/midtrans.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

      const updatedUser = await User.toggleBlock(parseInt(userId, 10));
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }

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

      const updatedUser = await User.adminAdjustBalance(
        userId,
        parseFloat(amount),
        'admin_deposit',
        reason || 'Deposit dari admin'
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }

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

      const currentBal = Number(user.balance ?? 0);
      if (currentBal < parseFloat(amount)) {
        return res.status(400).json({
          success: false,
          message: 'Saldo pengguna tidak cukup',
        });
      }

      const updatedUser = await User.adminAdjustBalance(
        userId,
        -parseFloat(amount),
        'admin_withdrawal',
        reason || 'Penarikan dari admin'
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }

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

  updateUserAdmin: async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, email, phone, role, is_active, is_blocked } = req.body;

      const existing = await User.findById(userId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }

      if (email && email !== existing.email) {
        const clash = await User.findByEmailExcludingId(email, userId);
        if (clash) {
          return res.status(400).json({
            success: false,
            message: 'Email sudah digunakan pengguna lain',
          });
        }
      }

      const payload = {};
      if (name !== undefined) payload.name = name;
      if (email !== undefined) payload.email = email;
      if (phone !== undefined) payload.phone = phone;
      if (role !== undefined) payload.role = role;
      if (is_active !== undefined) payload.is_active = is_active;
      if (is_blocked !== undefined) payload.is_blocked = is_blocked;

      const updated = await User.update(userId, payload);

      res.json({
        success: true,
        message: 'Data pengguna diperbarui',
        data: updated,
      });
    } catch (error) {
      console.error('Update user admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui pengguna',
      });
    }
  },

  /** Nonaktifkan akun (soft delete; aman untuk FK). */
  deactivateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const u = await User.findById(userId);
      if (!u) {
        return res.status(404).json({
          success: false,
          message: 'Pengguna tidak ditemukan',
        });
      }
      if (u.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menonaktifkan akun admin',
        });
      }
      const updated = await User.deactivate(userId);
      res.json({
        success: true,
        message: 'Pengguna dinonaktifkan',
        data: updated,
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menonaktifkan pengguna',
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
      const file = req.file;
      const request_file_url = file ? `/uploads/${file.filename}` : null;
      const safeTitle = (title && String(title).trim()) || 'Custom order';

      const customOrder = await CustomOrder.create({
        user_id: req.user.id,
        order_number: orderNumber,
        title: safeTitle,
        description,
        budget: parseFloat(budget),
        request_file_url,
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

  downloadResult: async (req, res) => {
    try {
      const id = req.params.id;
      const order = await CustomOrder.findById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
      }
      if (Number(order.user_id) !== Number(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }
      const paid =
        String(order.payment_status || '').toLowerCase() === 'completed' ||
        ['processing', 'completed', 'selesai', 'proses'].includes(String(order.status || '').toLowerCase());
      if (!paid) {
        return res.status(403).json({ success: false, message: 'Selesaikan pembayaran terlebih dahulu' });
      }
      const rel = order.result_file_url;
      if (!rel) {
        return res.status(404).json({ success: false, message: 'File hasil belum diunggah admin' });
      }
      const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
      const name = rel.replace(/^\/uploads\//, '').replace(/^\//, '');
      const filePath = path.join(uploadDir, name);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File tidak ditemukan di server' });
      }
      return res.download(filePath, `custom-order-${id}.zip`);
    } catch (error) {
      console.error('Download custom order error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengunduh file' });
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
        level: 'info',
        title: notificationTitle,
        message: notificationMessage,
        related_id: Number(orderId) || null,
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

      const st = String(customOrder.status || '');
      if (!['approved', 'diterima'].includes(st)) {
        return res.status(400).json({
          success: false,
          message: 'Setujui pesanan terlebih dahulu sebelum membuat invoice',
        });
      }

      if (customOrder.payment_status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Pembayaran custom order sudah selesai',
        });
      }

      if (!process.env.MIDTRANS_SERVER_KEY) {
        return res.status(503).json({
          success: false,
          message: 'Midtrans belum dikonfigurasi',
        });
      }

      const user = await User.findById(customOrder.user_id);
      const midtransOrderId = `CO-${customOrder.order_number}`;
      const gross = Math.round(Number(customOrder.budget) || 0);

      const parameter = {
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: gross,
        },
        customer_details: {
          first_name: user.name || 'Customer',
          email: user.email,
          phone: user.phone || '08123456789',
        },
        payment_type: 'qris',
      };

      const transaction = await snap.createTransaction(parameter);

      await CustomOrderPayment.create({
        custom_order_id: customOrder.id,
        amount: customOrder.budget,
        status: 'pending',
        midtrans_order_id: midtransOrderId,
        snap_token: transaction.token,
      });

      const updatedOrder = await CustomOrder.update(orderId, {
        payment_link: transaction.redirect_url,
        payment_status: 'pending',
      });

      res.json({
        success: true,
        message: 'Invoice pembayaran dibuat (QRIS)',
        data: {
          payment_link: transaction.redirect_url,
          snap_token: transaction.token,
          order_id: midtransOrderId,
          client_key: process.env.MIDTRANS_CLIENT_KEY || null,
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
          related_id: Number(orderId) || null,
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
