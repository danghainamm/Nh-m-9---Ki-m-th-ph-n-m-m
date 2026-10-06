const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { findById } = require("../models/SPModel");
const OrderModel = require('../models/orderModel');
const KHModel = require('../models/KHModel');

// Hiển thị trang đặt hàng
const showOrderPage = async (req, res) => {
  const { maSanPham } = req.params;
  const user = req.session.user;

  if (!user || user.userType !== 'kh') {
    return res.redirect('/?message=Vui lòng đăng nhập để đặt hàng');
  }

  try {
    const product = await findById(maSanPham);
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");

    const [diaChiList] = await pool.query(
      `SELECT * FROM DiaChi WHERE maKhachHang = ? ORDER BY laMacDinh DESC`,
      [user.maKhachHang]
    );

    // Fetch full customer record to ensure name/phone are present
    const customer = await KHModel.getCustomerById(user.maKhachHang) || user;
    const khachHangFull = { hoTen: customer.hoTen, soDienThoai: customer.soDienThoai, email: customer.email };

    res.render("order", {
      product,
      khachHang: khachHangFull,
      diaChiList
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).send("Lỗi hiển thị trang đặt hàng");
  }
};

// Xử lý gửi đơn hàng
const submitOrder = async (req, res) => {
  try {
    const order = await require('../services/checkout').placeOrder(req.session.user.maKhachHang, req.body, false);
    const needQRPayment = req.body.phuongThuc === 'Ngân hàng';
    res.json({ success: true, message: 'Đặt hàng thành công', order, needQRPayment,
      qrPaymentUrl: needQRPayment ? '/payment/thanh-toan-qr/' + order.maDonHang : null });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Không thể xử lý đơn hàng. Vui lòng thử lại.' });
  }
};

// Hiển thị trang checkout - CHỈ HIỂN THỊ SẢN PHẨM ĐÃ CHỌN
const showCheckoutPage = async (req, res) => {
  const user = req.session.user;

  if (!user || user.userType !== 'kh') {
    return res.redirect('/?message=Vui lòng đăng nhập để đặt hàng');
  }

  try {
    // LẤY SẢN PHẨM ĐÃ CHỌN TỪ SESSION
    // Frontend sẽ lưu vào sessionStorage, backend lấy từ query string hoặc session

    // Tạm thời lấy tất cả sản phẩm trong giỏ
    // Frontend sẽ filter trong client-side
    const CartModel = require('../models/cartModel');
    const allCartItems = await CartModel.getCartDetailsByCustomerId(user.maKhachHang);

    if (!allCartItems || allCartItems.length === 0) {
      return res.redirect('/cart?message=Giỏ hàng trống');
    }

    const [diaChiList] = await pool.query(
      `SELECT * FROM DiaChi WHERE maKhachHang = ? ORDER BY laMacDinh DESC`,
      [user.maKhachHang]
    );

    // GỬI TẤT CẢ SẢN PHẨM, FRONTEND SẼ LỌC
    res.render("checkout", {
      cartItems: allCartItems, // Frontend sẽ thay thế bằng selected items
      khachHang: user,
      diaChiList
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).send("Lỗi hiển thị trang đặt hàng");
  }
};

// Xử lý đặt hàng từ giỏ hàng
const submitCheckout = async (req, res) => {
  try {
    const order = await require('../services/checkout').placeOrder(req.session.user.maKhachHang, req.body, true);
    const needQRPayment = req.body.phuongThuc === 'Ngân hàng';
    res.json({ success: true, message: 'Đặt hàng thành công', order, needQRPayment,
      qrPaymentUrl: needQRPayment ? '/payment/thanh-toan-qr/' + order.maDonHang : null });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Không thể xử lý đơn hàng. Vui lòng thử lại.' });
  }
};

const showMyOrders = async (req, res) => {
  try {
    // Giả sử middleware xác thực đã gán thông tin khách hàng vào req.session.khachHang hoặc req.user
    // Cần kiểm tra session
    const khachHang = req.session.user; // Hoặc req.session.khachHang tùy vào cách lưu
    if (!khachHang) {
      return res.redirect('/');
    }


    const status = req.query.status || 'all';
    const maKhachHang = khachHang.maKhachHang;

    let orders = [];

    if (status === 'all') {
      orders = await OrderModel.getOrdersByCustomerId(maKhachHang);
    } else {
      orders = await OrderModel.getOrdersByCustomerIdAndStatus(maKhachHang, status);
    }

    res.render('my_orders', {
      orders,
      activeTab: status,
      khachHang // Truyền thông tin khách hàng để hiển thị header/sidebar nếu cần
    });
  } catch (error) {
    console.error("Lỗi hiển thị đơn hàng của tôi:", error);
    res.status(500).send("Lỗi server");
  }
};

// Hiển thị chi tiết đơn hàng cho khách hàng
const showOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const orderInfo = await OrderModel.getOrderById(id);
    if (!orderInfo || orderInfo.length === 0) {
      return res.status(404).send("Không tìm thấy đơn hàng");
    }

    // Kiểm tra quyền sở hữu đơn hàng
    const currentUser = req.session.user;
    if (orderInfo[0].maKhachHang !== currentUser.maKhachHang) {
      return res.status(403).send("Bạn không có quyền xem đơn hàng này");
    }

    const orderDetails = await OrderModel.getOrderDetails(id);

    res.render('chitietdonhang', {
      order: orderInfo[0],
      orderDetails,
      isCustomerView: true // Flag để ẩn/hiện các nút chức năng admin nếu dùng chung view
    });
  } catch (error) {
    console.error("Lỗi hiển thị chi tiết đơn hàng:", error);
    res.status(500).send("Lỗi server");
  }
};

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    await require('../services/checkout').changeStatus(req.params.id, 'Đã hủy', req.session.user.maKhachHang);
    res.json({ success: true, message: 'Hủy đơn hàng thành công' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Không thể hủy đơn hàng.' });
  }
};

module.exports = {
  showOrderPage,
  submitOrder,
  showCheckoutPage,
  submitCheckout,
  showMyOrders,
  showOrderDetail,
  cancelOrder
};
