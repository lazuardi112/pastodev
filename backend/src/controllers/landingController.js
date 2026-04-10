import { Product } from '../models/Product.js';
import { Category, SubCategory } from '../models/Category.js';
import { Testimonial } from '../models/Testimonial.js';
import { Settings } from '../models/Settings.js';
import { ContactInfo } from '../models/ContactInfo.js';

function truthy(val) {
  if (val == null) return false;
  const s = String(val).toLowerCase();
  return s === '1' || s === 'true' || s === 'yes';
}

export const landingController = {
  getLanding: async (req, res) => {
    try {
      const all = await Settings.getAll();

      const maintenance_mode = truthy(all.maintenance_mode?.value);
      const maintenance_message =
        all.maintenance_message?.value ||
        'Kami sedang melakukan pemeliharaan. Silakan kembali lagi nanti.';

      const contact = {
        whatsapp: all.contact_whatsapp?.value ?? '',
        email: all.contact_email?.value ?? '',
        phone: all.contact_phone?.value ?? '',
        address: all.contact_address?.value ?? '',
        hours: all.contact_hours?.value ?? '',
      };

      const [featured_products, latest_products, testimonials, categoriesRaw, contact_infos] =
        await Promise.all([
          Product.search({ featured: true, only_active: true, limit: 8, offset: 0 }),
          Product.search({ only_active: true, limit: 8, offset: 0 }),
          Testimonial.listActive(12),
          Category.getAll(true),
          ContactInfo.listAll().catch(() => []),
        ]);

      const categories = [];
      for (const c of categoriesRaw.slice(0, 9)) {
        const subs = await SubCategory.getByCategoryId(c.id);
        categories.push({
          ...c,
          subcategories: subs || [],
        });
      }

      res.json({
        success: true,
        data: {
          maintenance_mode,
          maintenance_message,
          contact,
          contact_infos,
          featured_products,
          latest_products,
          categories,
          testimonials,
        },
      });
    } catch (error) {
      console.error('Landing error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat data beranda',
      });
    }
  },
};
