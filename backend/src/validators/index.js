import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').toLowerCase(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').toLowerCase(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateProduct = [
  body('category_id').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('sub_category_id').optional().isInt({ min: 1 }),
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('description').notEmpty().withMessage('Product description is required').trim(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid number'),
];

export const validateReview = [
  body('product_id').isInt({ min: 1 }).withMessage('product_id tidak valid'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
];

export const validateVoucher = [
  body('code').notEmpty().withMessage('Voucher code is required').trim().toUpperCase(),
  body('discount_type')
    .isIn(['percentage', 'fixed'])
    .withMessage('Invalid discount type'),
  body('discount_value')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be valid'),
  body('min_purchase').optional().isFloat({ min: 0 }),
];

export const validateCheckout = [
  body('payment_method')
    .isIn(['midtrans_qris', 'balance'])
    .withMessage('Invalid payment method'),
  body('voucher_code').optional().trim(),
];

export const validateCustomOrder = [
  body('title').optional().trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be valid'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};
