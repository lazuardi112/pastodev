import { User } from '../models/User.js';
import { BalanceHistory } from '../models/Voucher.js';
import { generateToken, hashPassword, comparePassword } from '../utils/jwt.js';

export const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nama, email, dan password wajib diisi',
        });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar',
        });
      }

      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
      });

      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error saat registrasi',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi',
        });
      }

      const emailNorm = String(email).trim().toLowerCase();
      const user = await User.findByEmail(emailNorm);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
        });
      }

      // Check if blocked or inactive
      const isBlocked = user.is_blocked === 1 || user.is_blocked === true;
      const isActive = user.is_active === 1 || user.is_active === true;

      if (isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda telah diblokir',
        });
      }

      if (!isActive && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda belum aktif',
        });
      }

      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
        });
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
        });
      }

      // Update last login
      await User.updateLastLogin(user.id).catch(err => console.error('Update last login failed:', err));

      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance,
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error saat login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  loginWithGoogle: async (req, res) => {
    try {
      const { name, email, google_id, avatar_url } = req.body;

      if (!google_id || !email) {
        return res.status(400).json({
          success: false,
          message: 'Google ID dan email wajib ada',
        });
      }

      let user = await User.findByGoogleId(google_id);

      if (!user) {
        user = await User.findByEmail(email);
        if (!user) {
          // Create new user from Google
          user = await User.create({
            name,
            email,
            google_id,
            password: null,
            avatar_url
          });
        } else {
          // Update google_id for existing user
          await User.update(user.id, { google_id, avatar_url });
        }
      }

      if (user.is_blocked) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda telah diblokir',
        });
      }

      await User.updateLastLogin(user.id).catch(err => console.error('Update last login failed:', err));

      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Login dengan Google berhasil',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: user.balance,
          token,
        },
      });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error saat login Google',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil profil',
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, phone, avatar_url } = req.body;
      const user = await User.update(req.user.id, {
        name,
        phone,
        avatar_url,
      });

      res.json({
        success: true,
        message: 'Profil berhasil diperbarui',
        data: user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui profil',
      });
    }
  },

  getBalance: async (req, res) => {
    try {
      const result = await User.getBalance(req.user.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil saldo',
      });
    }
  },

  getBalanceHistory: async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const history = await BalanceHistory.getByUserId(
        req.user.id,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Get balance history error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil riwayat saldo',
      });
    }
  },
};
