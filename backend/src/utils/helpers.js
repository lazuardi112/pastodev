export const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

export const generateCustomOrderNumber = () => {
  const timestamp = Date.now().toString();
  return `Custom-${timestamp}`;
};

export const calculateDiscount = (amount, discountType, discountValue, maxDiscount = null) => {
  let discount = 0;

  if (discountType === 'percentage') {
    discount = (amount * discountValue) / 100;
    if (maxDiscount && discount > maxDiscount) {
      discount = maxDiscount;
    }
  } else if (discountType === 'fixed') {
    discount = discountValue;
  }

  return discount;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};
