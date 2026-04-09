# PastoDEV Marketplace API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Register
**POST** `/auth/register`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "08123456789"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Login
**POST** `/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_admin": false,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Google Login
**POST** `/auth/login-google`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "google_id": "google_user_id_here",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### 4. Get Profile
**GET** `/auth/profile`
- Requires: Authentication

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "avatar_url": null,
    "balance": 0,
    "is_admin": false,
    "is_active": true,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### 5. Update Profile
**PUT** `/auth/profile`
- Requires: Authentication

Request:
```json
{
  "name": "Jane Doe",
  "phone": "08987654321",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### 6. Get Balance
**GET** `/auth/balance`
- Requires: Authentication

Response:
```json
{
  "success": true,
  "data": {
    "balance": 500000
  }
}
```

### 7. Get Balance History
**GET** `/auth/balance-history?limit=50&offset=0`
- Requires: Authentication

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "type": "topup",
      "amount": 500000,
      "description": "Topup with order ID TOPUP-1234567890",
      "balance_before": 0,
      "balance_after": 500000,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

## Category Endpoints

### 1. Get All Categories
**GET** `/categories`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Software",
      "slug": "software",
      "description": "Software products",
      "icon_url": null,
      "thumbnail_url": null,
      "is_active": true,
      "sub_categories": [
        {
          "id": 1,
          "name": "Website Templates",
          "slug": "website-templates"
        }
      ]
    }
  ]
}
```

### 2. Get Category by ID
**GET** `/categories/:id`

### 3. Create Category (Admin)
**POST** `/categories`
- Requires: Authentication + Admin

Request:
```json
{
  "name": "Software",
  "slug": "software",
  "description": "Software products",
  "icon_url": "https://example.com/icon.png",
  "thumbnail_url": "https://example.com/thumb.png"
}
```

### 4. Update Category (Admin)
**PUT** `/categories/:id`
- Requires: Authentication + Admin

### 5. Delete Category (Admin)
**DELETE** `/categories/:id`
- Requires: Authentication + Admin

### 6. Get Sub Categories
**GET** `/categories/:categoryId/subcategories`

### 7. Create Sub Category (Admin)
**POST** `/categories/subcategories`
- Requires: Authentication + Admin

Request:
```json
{
  "category_id": 1,
  "name": "Website Templates",
  "slug": "website-templates",
  "description": "Website templates for sale"
}
```

---

## Product Endpoints

### 1. Get All Products
**GET** `/products?category_id=1&search=template&limit=20&offset=0`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "sub_category_id": 1,
      "name": "Professional Website Template",
      "slug": "professional-website-template",
      "description": "Modern website template",
      "price": 99999,
      "file_url": "/uploads/template.zip",
      "thumbnail_url": "/uploads/template-thumb.jpg",
      "views": 150,
      "is_active": true,
      "created_by": 1,
      "category_name": "Software",
      "sub_category_name": "Website Templates",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

### 2. Get Product by ID
**GET** `/products/:id`

Response includes reviews and review stats.

### 3. Create Product (Admin)
**POST** `/products`
- Requires: Authentication + Admin
- Content-Type: multipart/form-data

Request:
```
name: Professional Website Template
description: Modern website template
category_id: 1
sub_category_id: 1
price: 99999
file: (binary file)
thumbnail: (image file)
```

### 4. Update Product (Admin)
**PUT** `/products/:id`
- Requires: Authentication + Admin
- Content-Type: multipart/form-data

### 5. Delete Product (Admin)
**DELETE** `/products/:id`
- Requires: Authentication + Admin

### 6. Add Review
**POST** `/products/:productId/reviews`
- Requires: Authentication

Request:
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

### 7. Get Product Reviews
**GET** `/products/:productId/reviews`

---

## Cart Endpoints

### 1. Get Cart Items
**GET** `/cart/items`
- Requires: Authentication

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "product_id": 1,
      "quantity": 2,
      "name": "Professional Website Template",
      "price": 99999,
      "thumbnail_url": "/uploads/template-thumb.jpg"
    }
  ],
  "itemCount": 2
}
```

### 2. Add to Cart
**POST** `/cart/items`
- Requires: Authentication

Request:
```json
{
  "product_id": 1,
  "quantity": 1
}
```

### 3. Update Cart Item Quantity
**PUT** `/cart/items/:cartId`
- Requires: Authentication

Request:
```json
{
  "quantity": 3
}
```

### 4. Remove from Cart
**DELETE** `/cart/items/:cartId`
- Requires: Authentication

### 5. Clear Cart
**DELETE** `/cart`
- Requires: Authentication

---

## Checkout & Payment Endpoints

### 1. Checkout
**POST** `/cart/checkout`
- Requires: Authentication

Request:
```json
{
  "payment_method": "midtrans_qris",
  "voucher_code": "SAVE20"
}
```

Response (Midtrans):
```json
{
  "success": true,
  "message": "Payment token generated",
  "data": {
    "transaction_id": 1,
    "order_id": "ORD-123456789-abc",
    "snap_token": "token123...",
    "amount": 199998
  }
}
```

Response (Balance):
```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "transaction_id": 1,
    "order_id": "ORD-123456789-abc",
    "amount": 199998,
    "payment_method": "balance"
  }
}
```

### 2. Get User Transactions
**GET** `/cart/transactions?limit=20&offset=0`
- Requires: Authentication

### 3. Get Transaction Detail
**GET** `/cart/transactions/:transactionId`
- Requires: Authentication

### 4. Download Product
**GET** `/cart/download/:productId`
- Requires: Authentication
- Must have purchased the product

---

## Admin Endpoints

### 1. Get Dashboard Statistics
**GET** `/admin/dashboard`
- Requires: Authentication + Admin

Response:
```json
{
  "success": true,
  "data": {
    "total_users": 100,
    "total_transactions": 500,
    "success_transactions": 450,
    "total_revenue": 50000000,
    "average_transaction": 111111
  }
}
```

### 2. Get All Transactions (Admin)
**GET** `/admin/transactions?limit=20&offset=0`
- Requires: Authentication + Admin

### 3. Update Transaction Status (Admin)
**PUT** `/admin/transactions/:transactionId/status`
- Requires: Authentication + Admin

Request:
```json
{
  "status": "success"
}
```

### 4. Get All Users (Admin)
**GET** `/admin/users?limit=20&offset=0`
- Requires: Authentication + Admin

### 5. Create Voucher (Admin)
**POST** `/admin/vouchers`
- Requires: Authentication + Admin

Request:
```json
{
  "code": "SAVE20",
  "description": "Save 20% on all products",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_purchase": 100000,
  "max_discount": 500000,
  "usage_limit": 100,
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2024-12-31T23:59:59Z"
}
```

### 6. Get All Vouchers (Admin)
**GET** `/admin/vouchers?limit=20&offset=0`
- Requires: Authentication + Admin

### 7. Update Voucher (Admin)
**PUT** `/admin/vouchers/:id`
- Requires: Authentication + Admin

### 8. Delete Voucher (Admin)
**DELETE** `/admin/vouchers/:id`
- Requires: Authentication + Admin

### 9. Get Custom Orders (Admin)
**GET** `/admin/custom-orders?limit=20&offset=0`
- Requires: Authentication + Admin

### 10. Get Custom Order Detail
**GET** `/admin/custom-orders/:orderId`
- Requires: Authentication

### 11. Update Custom Order Status (Admin)
**PUT** `/admin/custom-orders/:orderId/status`
- Requires: Authentication + Admin

Request:
```json
{
  "status": "completed",
  "result_file_url": "/uploads/result.zip"
}
```

### 12. Add Message to Custom Order
**POST** `/admin/custom-orders/:orderId/messages`
- Requires: Authentication
- Content-Type: multipart/form-data

Request:
```
message: Order is being processed
file: (optional file)
```

### 13. Topup Balance
**POST** `/admin/topup`
- Requires: Authentication

Request:
```json
{
  "amount": 500000
}
```

Response:
```json
{
  "success": true,
  "message": "Topup token generated",
  "data": {
    "order_id": "TOPUP-1234567890",
    "snap_token": "token123...",
    "amount": 500000
  }
}
```

---

## Custom Order Endpoints

### 1. Create Custom Order
**POST** `/custom-orders`
- Requires: Authentication

Request:
```json
{
  "title": "Custom Website Development",
  "description": "I need a custom website...",
  "budget": 5000000
}
```

### 2. Get My Custom Orders
**GET** `/custom-orders/my-orders?limit=20&offset=0`
- Requires: Authentication

### 3. Get Custom Order Detail
**GET** `/custom-orders/:orderId`
- Requires: Authentication

### 4. Add Message to Custom Order
**POST** `/custom-orders/:orderId/messages`
- Requires: Authentication
- Content-Type: multipart/form-data

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Rate Limiting
Currently not implemented. Will be added in production.

---

## Pagination
Most list endpoints support:
- `limit`: Number of items to return (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

---

## Date Format
All timestamps use ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

---

## File Upload Limits
- Maximum file size: 50MB
- Allowed types: PDF, ZIP, 7Z, JPG, PNG, GIF, MP4, TXT
