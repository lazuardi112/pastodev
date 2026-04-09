import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Routes
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import checkoutRoutes from './routes/checkout.js';
import adminRoutes from './routes/admin.js';
import customOrderRoutes from './routes/customOrders.js';

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
  'http://localhost:5173',
  'http://localhost:8081',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8081'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all for easier testing
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', checkoutRoutes);
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
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server';

  if (NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 PastoDEV Marketplace API running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
});

export default app;
