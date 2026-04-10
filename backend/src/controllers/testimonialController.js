import { Testimonial } from '../models/Testimonial.js';

export const testimonialController = {
  list: async (req, res) => {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const rows = await Testimonial.listAll(parseInt(limit, 10), parseInt(offset, 10));
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('List testimonials error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil testimoni' });
    }
  },

  create: async (req, res) => {
    try {
      const { name, role, comment, avatar_initials, rating, display_order, is_active } = req.body;
      if (!name || !comment) {
        return res.status(400).json({ success: false, message: 'Nama dan komentar wajib diisi' });
      }
      const row = await Testimonial.create({
        name,
        role,
        comment,
        avatar_initials,
        rating: rating != null ? parseInt(rating, 10) : 5,
        display_order: display_order != null ? parseInt(display_order, 10) : 0,
        is_active: is_active !== false,
      });
      res.status(201).json({ success: true, message: 'Testimoni ditambahkan', data: row });
    } catch (error) {
      console.error('Create testimonial error:', error);
      res.status(500).json({ success: false, message: 'Gagal menambah testimoni' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await Testimonial.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
      }
      const row = await Testimonial.update(id, req.body);
      res.json({ success: true, message: 'Testimoni diperbarui', data: row });
    } catch (error) {
      console.error('Update testimonial error:', error);
      res.status(500).json({ success: false, message: 'Gagal memperbarui testimoni' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await Testimonial.delete(id);
      res.json({ success: true, message: 'Testimoni dihapus' });
    } catch (error) {
      console.error('Delete testimonial error:', error);
      res.status(500).json({ success: false, message: 'Gagal menghapus testimoni' });
    }
  },
};
