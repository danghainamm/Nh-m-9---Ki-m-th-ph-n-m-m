const express = require('express');
const router = express.Router();
const { showQRPaymentPage, verifyPayment } = require('../controllers/paymentController');

// Hiển thị trang thanh toán QR
router.get('/thanh-toan-qr/:maDonHang', showQRPaymentPage);

// Xác minh thanh toán
router.post('/verify-payment', verifyPayment);

module.exports = router;