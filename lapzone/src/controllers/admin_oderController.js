const OrderModel = require('../models/orderModel');

const OrderController = {
  // Hiển thị trang quản lý đơn hàng
  index: async (req, res) => {
    const quanTriVien = req.session.user;

    if (!quanTriVien) {
      return res.redirect('/');
    }

    try {
      const orders = await OrderModel.getAllOrders();
      res.render('order_management', {
        quanTriVien,
        orders,
        page: 'quanlydonhang'
      });
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err.code || err.message);
      return res.status(500).send('Lỗi server');
    }
  },

  // Lấy danh sách đơn hàng (API)
  getOrders: async(req, res) => {
    const { status, paymentStatus, keyword } = req.query;
    try {
      if (keyword) {
        const orders = await OrderModel.searchOrders(keyword);
        return res.json({ success: true, data: orders });
      } else if (paymentStatus) {
        const orders = await OrderModel.getOrdersByPaymentStatus(paymentStatus);
        return res.json({ success: true, data: orders });
      } else if (status) {
        const orders = await OrderModel.getOrdersByStatus(status);
        return res.json({ success: true, data: orders });
      } else {
        const orders = await OrderModel.getAllOrders();
        return res.json({ success: true, data: orders });
      }
    } catch (err) {
      console.error('Lỗi khi lấy đơn hàng (API):', err.code || err.message);
      return res.status(err.status || 500).json({ success: false, message: 'Lỗi khi lấy đơn hàng' });
    }
  },

  // Xem chi tiết đơn hàng
  viewOrder: async (req, res) => {
    const { maDonHang } = req.params;
    const quanTriVien = req.session.user;

    if (!quanTriVien) {
      return res.redirect('/');
    }

    try {
      const orderResults = await OrderModel.getOrderById(maDonHang);

      if (!orderResults || orderResults.length === 0) {
        return res.status(404).send('Không tìm thấy đơn hàng');
      }

      const order = orderResults[0];
      const details = await OrderModel.getOrderDetails(maDonHang);

      order.tongTien = Number(order.tongGiaTri);
      if (!order.tongTien) {
        order.tongTien = details.reduce((sum, item) => {
          return sum + item.soLuong * item.donGia;
        }, 0);
      }

      return res.render('chitietdonhang', {
        quanTriVien,
        order,
        orderDetails: details
      });

    } catch (err) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', err.code || err.message);
      return res.status(500).send('Lỗi khi lấy chi tiết đơn hàng');
    }
  },

  // Hiển thị form tạo đơn hàng
  createOrderForm: async(req, res) => {
    const quanTriVien = req.session.user;

    if (!quanTriVien) {
      return res.redirect('/');
    }

    try {
      const db = require('../config/db');
      const [customers] = await db.query("SELECT maKhachHang, hoTen FROM KhachHang WHERE trangThai = 'Hoạt động' ORDER BY hoTen");
      const [products] = await db.query('SELECT maSanPham, tenSanPham, giaBan, soLuongTon FROM SanPham WHERE soLuongTon > 0 ORDER BY tenSanPham');
      res.render('taodonhang', { quanTriVien, customers, products });
    } catch (error) {
      res.status(500).send('Không thể tải thông tin tạo đơn hàng.');
    }
  },

  // Tạo đơn hàng mới - FIXED
  createOrder: async (req, res) => {
    try {
      const orderData = req.body;


      // Validation
      if (!orderData.maKhachHang) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin khách hàng"
        });
      }

      // Dùng cùng giao dịch tính giá, tạo chi tiết và trừ tồn kho với đơn khách hàng.
      const result = await require('../services/checkout').placeOrder(orderData.maKhachHang, orderData);
      const maDonHang = result.maDonHang;


      // Lấy lại đầy đủ thông tin đơn để trả về client
      const newOrder = await OrderModel.getOrderBasicInfo(maDonHang);

      if (!newOrder) {
        return res.status(500).json({
          success: false,
          message: "Tạo đơn hàng thành công nhưng không thể lấy thông tin đơn"
        });
      }

      return res.json({
        success: true,
        message: "Tạo đơn hàng thành công",
        maDonHang: maDonHang,
        order: newOrder
      });

    } catch (err) {
      console.error("Lỗi chi tiết khi tạo đơn hàng:", err.code || err.message);
      return res.status(err.status || 500).json({
        success: false,
        message: err.status ? err.message : 'Không thể tạo đơn hàng.'
      });
    }
  },

  // Hiển thị form chỉnh sửa đơn hàng
  editOrderForm: async (req, res) => {
    const { maDonHang } = req.params;
    const quanTriVien = req.session.user;

    if (!quanTriVien) {
      return res.redirect('/');
    }

    try {
      const orderResults = await OrderModel.getOrderById(maDonHang);
      if (!orderResults || orderResults.length === 0) {
        return res.status(404).send('Không tìm thấy đơn hàng');
      }

      const order = orderResults[0];
      const details = await OrderModel.getOrderDetails(maDonHang);

      return res.render('suadonhang', {
        quanTriVien: quanTriVien,
        order: order,
        orderDetails: details
      });
    } catch (err) {
      console.error('Lỗi khi lấy đơn hàng để sửa:', err.code || err.message);
      return res.status(500).send('Lỗi khi lấy đơn hàng');
    }
  },

  // Cập nhật đơn hàng
  updateOrder: async (req, res) => {
    const { maDonHang } = req.params;
    const orderData = req.body;

    try {
      await OrderModel.updateOrder(maDonHang, orderData);
      return res.json({ success: true, message: 'Cập nhật đơn hàng thành công' });
    } catch (err) {
      console.error('Lỗi khi cập nhật đơn hàng:', err.code || err.message);
      return res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Lỗi khi cập nhật đơn hàng' });
    }
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (req, res) => {
    const { maDonHang } = req.params;
    const { trangThai } = req.body;

    try {
      await OrderModel.updateDeliveryStatus(maDonHang, trangThai);
      return res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err.code || err.message);
      return res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Lỗi khi cập nhật trạng thái' });
    }
  },

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus: async (req, res) => {
    const { maDonHang } = req.params;
    const { trangThaiThanhToan } = req.body;

    try {
      await OrderModel.updatePaymentStatus(maDonHang, trangThaiThanhToan);
      return res.json({ success: true, message: 'Cập nhật trạng thái thanh toán thành công' });
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái thanh toán:', err.code || err.message);
      return res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Lỗi khi cập nhật trạng thái thanh toán' });
    }
  },

  // Cập nhật trạng thái giao hàng
  updateDeliveryStatus: async (req, res) => {
    const { maDonHang } = req.params;
    const { trangThaiGiaoHang } = req.body;

    try {
      await OrderModel.updateDeliveryStatus(maDonHang, trangThaiGiaoHang);
      return res.json({ success: true, message: 'Cập nhật trạng thái giao hàng thành công' });
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái giao hàng:', err.code || err.message);
      return res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Lỗi khi cập nhật trạng thái giao hàng' });
    }
  },

  // Xóa đơn hàng
  deleteOrder: async(req, res) => {
    const { maDonHang } = req.params;

    try {
      await OrderModel.deleteOrder(maDonHang);
      return res.json({ success: true, message: 'Xóa đơn hàng thành công' });
    } catch (err) {
      console.error('Lỗi khi xóa đơn hàng:', err.code || err.message);
      return res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Lỗi khi xóa đơn hàng' });
    }
  },

  // Lấy thống kê đơn hàng
  getStatistics: async(req, res) => {
    try {
      const stats = await OrderModel.getOrderStatistics();
      return res.json({ success: true, data: stats });
    } catch (err) {
      console.error('Lỗi khi lấy thống kê đơn hàng:', err.code || err.message);
      return res.status(err.status || 500).json({ success: false, message: 'Lỗi khi lấy thống kê' });
    }
  }
};

module.exports = OrderController;
