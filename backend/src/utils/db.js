/**
 * Normalizes insert id from mysql2 ResultSetHeader or SQLite-compatible meta object.
 */
export function getInsertId(meta) {
  if (!meta || typeof meta !== 'object') return null;
  const raw = meta.insertId ?? meta.lastInsertRowid;
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
