import { User } from '../models/User.js';
import { BalanceHistory } from '../models/Voucher.js';
import { generateToken, hashPassword, comparePassword } from '../utils/jwt.js';

export const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;

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
        message: 'Registrasi gagal',
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
        });
      }

      if (user.is_blocked) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda telah diblokir',
        });
      }

      const isPasswordValid = user.password.startsWith('$2')
        ? await comparePassword(password, user.password)
        : password === user.password;
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah',
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

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
        message: 'Login gagal',
      });
    }
  },

  loginWithGoogle: async (req, res) => {
    try {
      const { name, email, google_id, avatar_url } = req.body;

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
          });
        } else {
          // Update google_id for existing user
          await User.update(user.id, { google_id });
        }
      }

      if (user.is_blocked) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda telah diblokir',
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

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
        message: 'Login Google gagal',
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
      const balance = await User.getBalance(req.user.id);
      res.json({
        success: true,
        data: balance,
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
