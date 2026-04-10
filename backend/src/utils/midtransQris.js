import { core } from '../config/midtrans.js';
import { logger } from './logger.js';

/**
 * QRIS via Core API (/v2/charge) sesuai dokumentasi Midtrans:
 * https://docs.midtrans.com/reference/qris
 */
export async function chargeQris({
  orderId,
  grossAmount,
  customerDetails,
  itemDetails,
  acquirer = 'gopay',
}) {
  if (!process.env.MIDTRANS_SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY tidak di-set');
  }

  const gross = Math.round(Number(grossAmount));
  if (!Number.isFinite(gross) || gross < 1) {
    throw new Error('gross_amount tidak valid');
  }

  const parameter = {
    payment_type: 'qris',
    transaction_details: {
      order_id: String(orderId),
      gross_amount: gross,
    },
    qris: {
      acquirer,
    },
  };

  if (customerDetails && typeof customerDetails === 'object') {
    parameter.customer_details = customerDetails;
  }

  if (Array.isArray(itemDetails) && itemDetails.length > 0) {
    parameter.item_details = itemDetails;
  }

  let chargeResponse;
  try {
    chargeResponse = await core.charge(parameter);
  } catch (e) {
    logger.error('Midtrans core.charge error', e?.ApiResponse || e?.message);
    const api = e?.ApiResponse;
    const msg =
      api?.status_message ||
      api?.error_messages?.[0] ||
      e?.message ||
      'Gagal membuat tagihan QRIS';
    throw new Error(msg);
  }

  const statusCode = chargeResponse?.status_code != null ? String(chargeResponse.status_code) : '';
  if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
    const msg =
      chargeResponse?.status_message ||
      chargeResponse?.validation_messages?.join?.(', ') ||
      `Midtrans charge gagal (${statusCode})`;
    logger.warn('Midtrans QRIS charge HTTP error', chargeResponse);
    throw new Error(msg);
  }

  const qr_string =
    chargeResponse?.qr_string ||
    chargeResponse?.qris?.qr_string ||
    chargeResponse?.actions?.find?.((a) => a?.name === 'generate-qr-code')?.url ||
    null;

  if (!qr_string || String(qr_string).trim() === '') {
    logger.warn('Midtrans QRIS: qr_string kosong', JSON.stringify(chargeResponse).slice(0, 500));
    throw new Error(
      'Respons Midtrans tidak berisi QR string. Pastikan metode QRIS aktif di dashboard Midtrans (sandbox).'
    );
  }

  return {
    raw: chargeResponse,
    qr_string,
    transaction_id: chargeResponse?.transaction_id ?? null,
    order_id: chargeResponse?.order_id ?? String(orderId),
    gross_amount: gross,
    transaction_status: chargeResponse?.transaction_status ?? null,
    expiry_time: chargeResponse?.expiry_time ?? chargeResponse?.qris?.expiry_time ?? null,
  };
}
