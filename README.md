# PastoDEV Marketplace - Fullstack Application

> A comprehensive digital marketplace platform by PastoDEV - Pasto Solusi Digital

## 🚀 Overview

PastoDEV Marketplace is a professional-grade fullstack e-commerce application designed for selling digital products, services, and custom work orders.

### Key Features

✅ Complete e-commerce platform  
✅ Secure authentication with JWT & Google OAuth  
✅ Payment integration with Midtrans QRIS  
✅ User wallet system with topup  
✅ Shopping cart & checkout with vouchers  
✅ Product reviews and ratings  
✅ Custom order system for freelance work  
✅ Admin panel with management tools  
✅ Secure file downloads  
✅ Production-ready code  

---

## 📊 Tech Stack

### Frontend
- React 18+ with TypeScript
- Vite build tool
- Tailwind CSS + Shadcn/UI

### Backend
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Midtrans payment gateway

---

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
createdb pastodev_marketplace
psql -U postgres -d pastodev_marketplace -f database.sql
cp .env.example .env
npm run dev
```

### Frontend
```bash
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev
```

---

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Database Schema](./backend/database.sql) - Database structure

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Admin middleware protection
- Input validation & sanitization
- CORS configuration
- Secure file uploads

---

**Version**: 1.0.0 | **Status**: Production Ready ✅
