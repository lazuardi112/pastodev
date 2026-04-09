# PastoDEV Marketplace - Quick Reference Guide

## 🚀 Start Development (30 seconds)

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2 - Frontend  
```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 📚 Key Files to Know

### Backend
- **Entry Point**: `backend/src/server.js`
- **Database Schema**: `backend/database.sql`
- **API Routes**: `backend/src/routes/`
- **Controllers**: `backend/src/controllers/`
- **Models**: `backend/src/models/`

### Frontend
- **API Service**: `src/services/api.ts`
- **Types**: `src/types/api.ts`
- **API Client**: `src/services/apiClient.ts`

### Documentation
- **Full API Docs**: `API_DOCUMENTATION.md`
- **Setup Instructions**: `SETUP_GUIDE.md`
- **This File**: `PROJECT_SUMMARY.md`

---

## 🔧 Configuration

### Backend Environment (.env)
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pastodev_marketplace
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
JWT_SECRET=your_secret
MIDTRANS_SERVER_KEY=your_key
MIDTRANS_CLIENT_KEY=your_key
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment (.env.local)
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Setup

```bash
# Create database
createdb pastodev_marketplace

# Import schema
psql -U postgres -d pastodev_marketplace -f backend/database.sql

# Or using psql
psql -U postgres
CREATE DATABASE pastodev_marketplace;
\c pastodev_marketplace
\i backend/database.sql
```

---

## 📡 Common API Calls

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "pass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "pass123"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products?limit=20
```

### Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}'
```

---

## 👨‍💻 Frontend API Usage

```typescript
import { productService, cartService, checkoutService } from '@/services/api';

// Get products
const { data: products } = await productService.getAll();

// Add to cart
await cartService.addItem({ product_id: 1, quantity: 1 });

// Checkout
const { data: transaction } = await checkoutService.checkout({
  payment_method: 'midtrans_qris',
  voucher_code: 'SAVE20'
});
```

---

## 🔑 Key Components

### Authentication
- Register & Login endpoints
- Google OAuth ready
- JWT token-based
- Password hashing with bcrypt

### Shopping
- Product catalog
- Shopping cart
- Checkout with discount codes
- Two payment methods

### Payment
- Midtrans QRIS integration
- Wallet/Balance payment
- Transaction tracking

### Admin
- Dashboard with statistics
- Product management
- Voucher management
- Custom order management
- User management

### User Features
- Profile management
- Balance viewing
- Transaction history
- Product downloads
- Reviews & ratings

---

## 📊 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| users | User accounts | id, email, password, balance |
| categories | Product groups | id, name, slug |
| sub_categories | Category subdivision | id, category_id |
| products | Marketplace items | id, category_id, price, file_url |
| cart | Shopping carts | id, user_id, product_id |
| transactions | Orders | id, user_id, order_id, status |
| transaction_items | Order details | id, transaction_id, product_id |
| reviews | Product ratings | id, product_id, rating |
| vouchers | Discount codes | id, code, discount_value |
| balance_history | Balance log | id, user_id, amount |
| custom_orders | Freelance work | id, user_id, status |
| custom_order_messages | Order chat | id, custom_order_id, message |

---

## 🔍 Debugging Tips

### Backend Issues
1. Check `.env` file is created
2. Verify PostgreSQL is running
3. Check console output for errors
4. Use `npm run dev` for detailed logs

### Frontend Issues
1. Check API URL in `.env.local`
2. Verify backend is running
3. Check browser console for errors
4. Use Vue/React DevTools

### Database Issues
1. Verify psql connection: `psql -U postgres`
2. Check database exists: `\l`
3. Check tables: `\dt`
4. Read schema: `\d products`

---

## 📦 Project Structure

```
pasto-code-hub-main/
├── backend/              # Express API server
├── src/                  # React frontend
├── API_DOCUMENTATION.md  # Complete API reference
├── SETUP_GUIDE.md       # Detailed setup
├── PROJECT_SUMMARY.md   # This summary
└── README.md            # Project overview
```

---

## ✅ Features Checklist

- ✅ User authentication
- ✅ Product management
- ✅ Shopping cart
- ✅ Checkout process
- ✅ Payment integration (Midtrans)
- ✅ Wallet/Balance system
- ✅ Voucher system
- ✅ Product reviews
- ✅ Custom orders
- ✅ Admin panel
- ✅ File downloads
- ✅ User management

---

## 🎨 Design Colors

```
Primary: #00acc2 (Teal)
Secondary: #2196F3 (Blue)
Success: #4CAF50 (Green)
Warning: #FF9800 (Orange)
Error: #F44336 (Red)
```

---

## 📞 Quick Links

- **API Docs**: `API_DOCUMENTATION.md`
- **Setup Guide**: `SETUP_GUIDE.md`
- **Database Schema**: `backend/database.sql`
- **Frontend Services**: `src/services/api.ts`
- **Backend Routes**: `backend/src/routes/`

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env |
| Database connection error | Check PostgreSQL running |
| CORS error | Verify FRONTEND_URL in .env |
| 401 Unauthorized | Token expired, login again |
| File upload fails | Check upload permissions |
| Midtrans error | Verify sandbox credentials |

---

## 🎯 Daily Workflow

1. **Start Backend**: `npm run dev` in backend folder
2. **Start Frontend**: `npm run dev` in frontend folder
3. **Test API**: Use endpoints from API_DOCUMENTATION.md
4. **Check Admin**: Browse to /admin section
5. **Debug**: Check browser console & server logs

---

**Last Updated**: April 9, 2024
**Project**: PastoDEV Marketplace v1.0.0
