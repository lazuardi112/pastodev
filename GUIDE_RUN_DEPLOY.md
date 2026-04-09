# PastoDEV Marketplace Project

Proyek marketplace digital (fullstack) menggunakan React (Frontend) dan Node.js (Backend) dengan database MySQL (SQLite fallback).

## Cara Menjalankan Project di Local (XAMPP)

### 1. Persiapan Database
- Pastikan XAMPP berjalan (Apache & MySQL).
- Buka phpMyAdmin, buat database baru bernama `xcreatem_store`.
- Import file `backend/database.sql` ke database tersebut.

### 2. Konfigurasi Backend
- Masuk ke folder `backend`.
- Salin file `.env.example` menjadi `.env`.
- Sesuaikan konfigurasi database di `.env`:
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=xcreatem_store
  DB_USER=root
  DB_PASSWORD=
  ```
- Jalankan perintah:
  ```bash
  npm install
  npm start
  ```

### 3. Konfigurasi Frontend
- Masuk ke root project.
- Jalankan perintah:
  ```bash
  npm install
  npm run dev
  ```
- Buka `http://localhost:5173` di browser.

## Cara Deploy ke Hosting (Cloudhebat)

### 1. Persiapan Database di Hosting
- Buat database MySQL di cPanel/Panel Hosting.
- Buat user database dan hubungkan ke database dengan akses penuh.
- Import `backend/database.sql` via phpMyAdmin hosting.

### 2. Upload Backend
- Upload semua file di folder `backend` ke folder `public_html/api` atau folder pilihan Anda.
- Sesuaikan `.env` di hosting dengan kredensial dari Cloudhebat:
  ```env
  DB_HOST=stellar.cloudhebat.com
  DB_USER=xcreatem_store_user
  DB_PASSWORD=your_password
  DB_NAME=xcreatem_store_db
  NODE_ENV=production
  ```
- Pastikan `Node.js App` sudah dikonfigurasi di panel hosting untuk menjalankan `src/server.js`.

### 3. Build & Upload Frontend
- Di local, jalankan `npm run build`.
- Upload isi folder `dist` ke folder `public_html` di hosting.
- Pastikan `VITE_API_URL` pada saat build mengarah ke URL API production Anda.

## Perubahan yang Dilakukan
1.  **Koneksi Database Robust**: Menggunakan `mysql2/promise` dengan fallback otomatis ke SQLite jika MySQL gagal terhubung.
2.  **Keamanan**: Implementasi Prepared Statements menggunakan placeholder `$n` yang otomatis dikonversi ke format yang sesuai (`?`).
3.  **Clean Code & Modular**: Refactor controller dan model untuk memisahkan logika bisnis dan akses data.
4.  **Error Handling**: Penambahan middleware global error handling dan logging yang lebih detail.
5.  **REST API Standar**: Menstandarisasi response JSON (`success`, `message`, `data`) di semua endpoint.
6.  **CORS Fix**: Konfigurasi CORS yang dinamis dan aman untuk mendukung frontend di berbagai domain.
7.  **Validasi Input**: Penambahan validasi di sisi backend untuk mencegah Bad Request (HTTP 400).
