import { Settings, Notification } from '../models/Settings.js';

export const settingsController = {
  getAllSettings: async (req, res) => {
    try {
      const settings = await Settings.getAll();

      const settingsMap = {};
      settings.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });

      res.json({
        success: true,
        data: settingsMap,
      });
    } catch (error) {
      console.error('Get all settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil pengaturan',
      });
    }
  },

  getSetting: async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await Settings.get(key);

      if (!setting) {
        return res.status(404).json({
          success: false,
          message: 'Pengaturan tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: setting,
      });
    } catch (error) {
      console.error('Get setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil pengaturan',
      });
    }
  },

  updateSetting: async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description } = req.body;

      const setting = await Settings.update(key, value, description);

      res.json({
        success: true,
        message: 'Pengaturan berhasil diperbarui',
        data: setting,
      });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui pengaturan',
      });
    }
  },

  updateMultipleSettings: async (req, res) => {
    try {
      const settings = req.body; // Expected: { key1: value1, key2: value2, ... }

      const updatedSettings = {};
      for (const [key, value] of Object.entries(settings)) {
        const updated = await Settings.set(key, value);
        updatedSettings[key] = updated.value;
      }

      res.json({
        success: true,
        message: 'Pengaturan berhasil diperbarui',
        data: updatedSettings,
      });
    } catch (error) {
      console.error('Update multiple settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui pengaturan',
      });
    }
  },
};

export const notificationController = {
  getNotifications: async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const notifications = await Notification.getByUserId(
        req.user.id,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil notifikasi',
      });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const count = await Notification.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: { unread_count: count },
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil jumlah notifikasi',
      });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const notification = await Notification.markAsRead(notificationId);

      res.json({
        success: true,
        message: 'Notifikasi berhasil ditandai sebagai sudah dibaca',
        data: notification,
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menandai notifikasi',
      });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      await Notification.markAllAsRead(req.user.id);

      res.json({
        success: true,
        message: 'Semua notifikasi berhasil ditandai sebagai sudah dibaca',
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menandai notifikasi',
      });
    }
  },

  deleteNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;
      await Notification.delete(notificationId);

      res.json({
        success: true,
        message: 'Notifikasi berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus notifikasi',
      });
    }
  },

  deleteAllNotifications: async (req, res) => {
    try {
      await Notification.deleteByUserId(req.user.id);

      res.json({
        success: true,
        message: 'Semua notifikasi berhasil dihapus',
      });
    } catch (error) {
      console.error('Delete all notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus notifikasi',
      });
    }
  },
};
