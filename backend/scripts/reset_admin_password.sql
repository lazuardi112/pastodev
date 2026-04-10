-- Jalankan di phpMyAdmin / MySQL jika login admin@pastopup.id tetap gagal.
-- Password setelah ini: ardigg12
-- (hash bcrypt $2a$, cocok dengan bcryptjs di backend)

UPDATE users
SET
  password = '$2a$10$PCQKVBw2C10xosV.rkZcUOsPeNdLeKLF4d2Ik2v5DDr7PkVPaVSnK',
  role = 'admin',
  is_active = 1,
  is_blocked = 0
WHERE email = 'admin@pastopup.id';

-- Jika belum ada baris admin sama sekali:
-- INSERT INTO users (name, email, password, role, is_active, is_blocked)
-- VALUES (
--   'Admin PastoDEV',
--   'admin@pastopup.id',
--   '$2a$10$PCQKVBw2C10xosV.rkZcUOsPeNdLeKLF4d2Ik2v5DDr7PkVPaVSnK',
--   'admin', 1, 0
-- );
