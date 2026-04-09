# PastoDEV Marketplace - Setup Guide

## Overview
PastoDEV by Pasto Solusi Digital is a comprehensive fullstack marketplace application with the following technologies:
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

## Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or bun package manager

## Directory Structure
```
pasto-code-hub-main/
├── frontend/                 # React frontend (current project)
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # UI components
│   │   ├── services/        # API service layer
│   │   ├── context/         # React context for state
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   └── lib/             # Utility functions
│   └── package.json
│
└── backend/                  # Express backend API
    ├── src/
    │   ├── server.js        # Main entry point
    │   ├── routes/          # API routes
    │   ├── controllers/     # Business logic
    │   ├── models/          # Database queries
    │   ├── middlewares/     # Express middlewares
    │   ├── validators/      # Input validation
    │   ├── services/        # Business services
    │   ├── utils/           # Utility functions
    │   └── config/          # Configuration files
    ├── uploads/             # User uploads directory
    ├── database.sql         # Database schema
    └── package.json
```

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE pastodev_marketplace;

-- Connect to new database
\c pastodev_marketplace

-- Import schema
\i database.sql
```

Or use the SQL file directly:
```bash
psql -U postgres -d pastodev_marketplace -f database.sql
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file:
```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pastodev_marketplace
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_make_it_long_and_secure
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Midtrans Configuration
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 4. Start Backend Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
# or
bun install
```

### 2. Configure Environment Variables
Create `.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
# or
bun run dev
```

Frontend will run on `http://localhost:5173`

---

## Database Schema Overview

### Key Tables
1. **users** - User accounts and authentication
2. **categories** - Main product categories
3. **sub_categories** - Sub categories under main categories
4. **products** - Marketplace products with files
5. **cart** - Shopping cart items
6. **transactions** - Purchase transactions
7. **transaction_items** - Items in a transaction
8. **reviews** - Product reviews and ratings
9. **vouchers** - Discount codes
10. **balance_history** - User balance transactions
11. **custom_orders** - Freelance/custom order requests
12. **custom_order_messages** - Messages in custom orders

---

## Main Features

### 1. Authentication
- ✅ Email/Password registration and login
- ✅ Google OAuth login
- ✅ JWT token-based authentication
- ✅ Protected routes with middleware

### 2. Categories & Products
- ✅ Hierarchical categories with subcategories
- ✅ Product creation with file uploads
- ✅ Product search and filtering by category
- ✅ Product views tracking

### 3. Shopping Cart & Checkout
- ✅ Add/remove items from cart
- ✅ Update quantities
- ✅ Apply voucher codes
- ✅ Two payment methods:
  - Balance/Wallet payment
  - Midtrans QRIS integration

### 4. Payment Integration
- ✅ Midtrans Core API integration
- ✅ QRIS payment method
- ✅ Payment status tracking
- ✅ Webhook callback handling

### 5. User Balance System
- ✅ Wallet balance management
- ✅ Topup functionality via Midtrans
- ✅ Balance history tracking
- ✅ Transaction audit logs

### 6. Product Downloads
- ✅ Download only after successful purchase
- ✅ Secure file access
- ✅ Purchase verification

### 7. Reviews & Ratings
- ✅ Product rating (1-5 stars)
- ✅ Review comments
- ✅ Average rating calculation
- ✅ Star distribution stats

### 8. Voucher System
- ✅ Percentage and fixed amount discounts
- ✅ Minimum purchase requirements
- ✅ Max discount limits
- ✅ Expiration dates
- ✅ Usage tracking and limits

### 9. Custom Orders (Freelance)
- ✅ Create custom work orders
- ✅ Title, description, budget
- ✅ Status tracking (pending → processing → completed)
- ✅ Admin-user messaging
- ✅ File attachments support

### 10. Admin Panel
- ✅ Dashboard with statistics
- ✅ User management
- ✅ Transaction management
- ✅ Product management (CRUD)
- ✅ Category/Subcategory management
- ✅ Voucher management
- ✅ Custom order management
- ✅ Manual payment status updates

---

## API Integration Examples

### Frontend API Calls

```typescript
import { authService, productService, checkoutService } from '@/services/api';

// Register
const {data} = await authService.register({
  name: "John",
  email: "john@example.com",
  password: "password123",
});

// Get Products
const {data: products} = await productService.getAll(
  categoryId = 1,
  search = "template",
  limit = 20,
  offset = 0
);

// Add to Cart
await cartService.addItem({product_id: 1, quantity: 1});

// Checkout
const {data: transaction} = await checkoutService.checkout({
  payment_method: "midtrans_qris",
  voucher_code: "SAVE20"
});
```

---

## Running Both Frontend and Backend

### Option 1: Separate Terminals
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd src (or frontend)
npm run dev
```

### Option 2: Using package.json scripts
Create a root `package.json` with:
```json
{
  "scripts": {
    "dev": "concurrently \"npm --prefix backend run dev\" \"npm --prefix src run dev\""
  }
}
```

---

## Database Migrations & Updates

### Adding New Fields
1. Create SQL migration file
2. Update TypeScript types
3. Update models if needed
4. Run migration on database

Example:
```sql
ALTER TABLE products ADD COLUMN new_field VARCHAR(255);
```

---

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Update `MIDTRANS_IS_PRODUCTION=true` for production
3. Use environment variables for secrets
4. Enable proper logging
5. Set up HTTPS/SSL
6. Configure CORS properly
7. Use process manager (PM2)

### Frontend
1. Build for production: `npm run build`
2. Deploy to CDN or static hosting
3. Configure proper API URLs for production
4. Enable gzip compression

---

## Testing

### Backend Routes Testing
Use Postman or cURL to test endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get Products
curl http://localhost:5000/api/products
```

---

## Security Considerations

1. ✅ **Input Validation**: All inputs validated using express-validator
2. ✅ **Auth Middleware**: Protects sensitive routes
3. ✅ **JWT Tokens**: Secure token-based authentication
4. ✅ **Password Hashing**: bcrypt for password hashing
5. ✅ **CORS Configuration**: Frontend/Backend CORS setup
6. ✅ **File Upload Security**: File type validation
7. ⚠️ **Rate Limiting**: Not implemented (TODO)
8. ⚠️ **Request Logging**: Not implemented (TODO)

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution: Ensure PostgreSQL is running and credentials are correct

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution: Change PORT in `.env` or kill process on that port

### Midtrans Integration Not Working
- Verify server key is correct
- Check sandbox vs production mode
- Ensure callback URL is accessible

### CORS Error
- Update `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `server.js`

---

## Additional Notes

- Default theme color: **#00acc2**
- Responsive design using Tailwind CSS
- Modern UI with smooth animations
- Modular and scalable architecture

---

## Support & Documentation

For more information:
- Api Documentation: See `API_DOCUMENTATION.md`
- Database Schema: See `backend/database.sql`
- Frontend Components: See `src/components/`
- Backend Routes: See `backend/src/routes/`

---

## License
MIT

## Author
Pasto Solusi Digital
