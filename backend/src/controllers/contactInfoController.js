import { ContactInfo } from '../models/ContactInfo.js';

export const contactInfoController = {
  listPublic: async (req, res) => {
    try {
      const rows = await ContactInfo.listAll();
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('contactInfo listPublic', error);
      res.status(500).json({ success: false, message: 'Gagal memuat kontak' });
    }
  },

  listAdmin: async (req, res) => {
    try {
      const rows = await ContactInfo.listAll();
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('contactInfo listAdmin', error);
      res.status(500).json({ success: false, message: 'Gagal memuat kontak' });
    }
  },

  create: async (req, res) => {
    try {
      const row = await ContactInfo.create(req.body || {});
      res.status(201).json({ success: true, message: 'Kontak ditambahkan', data: row });
    } catch (error) {
      console.error('contactInfo create', error);
      res.status(500).json({ success: false, message: 'Gagal menambah kontak' });
    }
  },

  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const row = await ContactInfo.update(id, req.body || {});
      if (!row) {
        return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
      }
      res.json({ success: true, message: 'Kontak diperbarui', data: row });
    } catch (error) {
      console.error('contactInfo update', error);
      res.status(500).json({ success: false, message: 'Gagal memperbarui kontak' });
    }
  },

  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await ContactInfo.delete(id);
      res.json({ success: true, message: 'Kontak dihapus' });
    } catch (error) {
      console.error('contactInfo delete', error);
      res.status(500).json({ success: false, message: 'Gagal menghapus kontak' });
    }
  },
};
