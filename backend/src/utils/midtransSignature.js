import crypto from 'crypto';

/**
 * Verifies Midtrans HTTP(S) notification signature_key.
 * @see https://docs.midtrans.com/reference/notification-json
 */
export function verifyMidtransNotificationSignature(body, serverKey) {
  if (!serverKey || typeof serverKey !== 'string') {
    return false;
  }
  const orderId = body?.order_id != null ? String(body.order_id) : '';
  const statusCode = body?.status_code != null ? String(body.status_code) : '';
  const grossAmount = body?.gross_amount != null ? String(body.gross_amount) : '';
  const signatureKey = body?.signature_key != null ? String(body.signature_key) : '';

  if (!orderId || !statusCode || !grossAmount || !signatureKey) {
    return false;
  }

  const payload = orderId + statusCode + grossAmount + serverKey;
  const expected = crypto.createHash('sha512').update(payload).digest('hex');
  return expected === signatureKey;
}
