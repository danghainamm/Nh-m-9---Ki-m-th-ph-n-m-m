const express = require("express");
const router = express.Router();

const {
  submitOrder,
  showOrderPage,
  showCheckoutPage,
  submitCheckout,
  showMyOrders,
  showOrderDetail,
  cancelOrder,
} = require("../controllers/orderController");

// Hiển thị trang đặt hàng (GET)
router.get("/dat-hang/:maSanPham", showOrderPage);

// Gửi đơn hàng (POST)
router.post("/dat-hang", submitOrder);

// Hiển thị trang đặt hàng từ giỏ hàng (GET)
router.get("/checkout", showCheckoutPage);

// Xử lý đặt hàng từ giỏ hàng (POST)
router.post("/checkout", submitCheckout);

// Xem danh sách đơn hàng của tôi
router.get("/my-orders", showMyOrders);
router.get("/my-orders/:id", showOrderDetail);

// Hủy đơn hàng
router.post("/cancel/:id", cancelOrder);

module.exports = router;
