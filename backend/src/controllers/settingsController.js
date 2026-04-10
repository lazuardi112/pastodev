import { Settings, Notification } from '../models/Settings.js';
import { User } from '../models/User.js';

async function notifyAdminsSettingsChanged(keysLabel) {
  try {
    const ids = await User.getAdminIds();
    const label = Array.isArray(keysLabel) ? keysLabel.join(', ') : String(keysLabel || '');
    for (const uid of ids) {
      await Notification.create({
        user_id: uid,
        type: 'settings_updated',
        level: 'info',
        title: 'Perubahan berhasil disimpan',
        message: label ? `Pengaturan diperbarui: ${label}` : 'Pengaturan situs telah diperbarui.',
        related_id: null,
      });
    }
  } catch (e) {
    console.error('notifyAdminsSettingsChanged', e);
  }
}

export const settingsController = {
  /** Tema & branding untuk frontend (tanpa auth). */
  getPublicTheme: async (req, res) => {
    try {
      const keys = [
        'theme_primary_color',
        'theme_secondary_color',
        'theme_button_color',
        'theme_background',
        'site_logo_url',
        'site_title',
      ];
      const all = await Settings.getAll();
      const data = {};
      for (const k of keys) {
        data[k] = all[k]?.value ?? null;
      }
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error('Get public theme error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat tema',
      });
    }
  },

  getAllSettings: async (req, res) => {
    try {
      const settings = await Settings.getAll();
      const settingsMap = {};
      for (const [key, meta] of Object.entries(settings)) {
        settingsMap[key] = meta?.value ?? '';
      }

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

      const setting =
        description !== undefined && description !== ''
          ? await Settings.set(key, value, description)
          : await Settings.update(key, value);

      notifyAdminsSettingsChanged([key]).catch(() => {});

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
      const keys = [];
      for (const [key, value] of Object.entries(settings)) {
        const updated = await Settings.set(key, value);
        updatedSettings[key] = updated.value;
        keys.push(key);
      }

      notifyAdminsSettingsChanged(keys).catch(() => {});

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

  /** Admin: kirim notifikasi in-app ke semua user atau satu user (kotak notifikasi di dashboard). */
  sendBroadcast: async (req, res) => {
    try {
      const { title, message, send_to_all, user_id } = req.body;
      const t = typeof title === 'string' ? title.trim() : '';
      const m = typeof message === 'string' ? message.trim() : '';
      if (!t || !m) {
        return res.status(400).json({
          success: false,
          message: 'Judul dan pesan wajib diisi',
        });
      }

      const all =
        send_to_all === true ||
        send_to_all === 'true' ||
        send_to_all === 1 ||
        send_to_all === '1';

      let ids = [];
      if (all) {
        ids = await User.getAllUserIds();
      } else {
        const uid = Number(user_id);
        if (!Number.isFinite(uid) || uid < 1) {
          return res.status(400).json({
            success: false,
            message: 'Untuk satu pengguna, berikan user_id yang valid',
          });
        }
        ids = [uid];
      }

      if (ids.length === 0) {
        return res.json({
          success: true,
          message: 'Tidak ada penerima',
          data: { count: 0 },
        });
      }

      const type = 'admin_broadcast';
      let sent = 0;
      for (const uid of ids) {
        await Notification.create({
          user_id: uid,
          type,
          level: 'info',
          title: t,
          message: m,
          related_id: null,
        });
        sent += 1;
      }

      res.json({
        success: true,
        message: `Notifikasi terkirim ke ${sent} pengguna`,
        data: { count: sent },
      });
    } catch (error) {
      console.error('Send broadcast notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim notifikasi',
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
