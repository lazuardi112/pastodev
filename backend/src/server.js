import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { logger } from './utils/logger.js';

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import checkoutRoutes from './routes/checkout.js';
import adminRoutes from './routes/admin.js';
import customOrderRoutes from './routes/customOrders.js';
import transactionsRoutes from './routes/transactions.js';
import topupRoutes from './routes/topup.js';
import ordersRoutes from './routes/orders.js';
import reviewsRoutes from './routes/reviews.js';
import { midtransController } from './controllers/paymentController.js';
import { settingsController } from './controllers/settingsController.js';
import publicRoutes from './routes/public.js';
import { maintenanceMiddleware } from './middlewares/maintenance.js';

const app = express();

const NODE_ENV = process.env.NODE_ENV || 'development';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
].filter(Boolean);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  if (NODE_ENV === 'production') {
    logger.error('JWT_SECRET must be set and at least 16 characters in production.');
    process.exit(1);
  }
  logger.warn('JWT_SECRET missing or short; using insecure dev default (set JWT_SECRET in .env)');
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'pastodev-dev-secret-change-me';
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS rejected origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(maintenanceMiddleware);

// Static files
app.use('/uploads', express.static(uploadDir));

// Request logging middleware
app.use((req, res, next) => {
  if (NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PastoDEV Marketplace API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

app.get('/api/settings/public', settingsController.getPublicTheme);

app.use('/api/public', publicRoutes);

/** Midtrans notification (tanpa JWT) */
app.post('/api/midtrans/callback', midtransController.callback);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', checkoutRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/topup', topupRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/custom-orders', customOrderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rute ${req.path} tidak ditemukan`,
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server';

  logger.error(`${req.method} ${req.path}`, err.message);

  res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { error: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 PastoDEV Marketplace API running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
});

export default app;
