import jwt from 'jsonwebtoken';
import { Settings } from '../models/Settings.js';

function truthy(val) {
  if (val == null) return false;
  const s = String(val).toLowerCase();
  return s === '1' || s === 'true' || s === 'yes';
}

function isWhitelisted(path) {
  const exact = ['/api/health', '/api/settings/public', '/api/midtrans/callback'];
  if (exact.some((p) => path === p)) return true;
  if (path.startsWith('/uploads')) return true;
  if (path.startsWith('/api/public')) return true;
  if (path.startsWith('/api/auth/register') || path.startsWith('/api/auth/login')) return true;
  if (path.startsWith('/api/auth/login-google')) return true;
  return false;
}

/**
 * Jika maintenance_mode aktif, blokir API untuk non-admin.
 * Admin: Bearer JWT dengan role admin.
 */
export async function maintenanceMiddleware(req, res, next) {
  try {
    if (isWhitelisted(req.path)) {
      return next();
    }

    const all = await Settings.getAll();
    const maintenance_mode = truthy(all.maintenance_mode?.value);
    if (!maintenance_mode) {
      return next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.role === 'admin') {
          return next();
        }
      } catch {
        /* fall through */
      }
    }

    const message =
      all.maintenance_message?.value ||
      'Kami sedang melakukan pemeliharaan. Silakan kembali lagi nanti.';

    return res.status(503).json({
      success: false,
      maintenance: true,
      message,
    });
  } catch (e) {
    return next();
  }
}
