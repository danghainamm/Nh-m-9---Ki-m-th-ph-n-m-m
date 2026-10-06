const ReviewModel = require("../models/reviewModel");

class ReviewController {
  // THÊM ĐÁNH GIÁ
  static async addReview(req, res) {
    try {
      const { productId, star, content } = req.body;


      // Kiểm tra đăng nhập
      if (!req.session.user) {
        return res.json({
          success: false,
          message: "Vui lòng đăng nhập để đánh giá!",
        });
      }

      const maKhachHang = req.session.user.maKhachHang;
      const userName = req.session.user.name;

      // Validate input
      if (!productId || !star || !content) {
        return res.json({
          success: false,
          message: "Thiếu thông tin đánh giá!",
        });
      }

      if (!Number.isInteger(Number(star)) || Number(star) < 1 || Number(star) > 5) {
        return res.json({
          success: false,
          message: "Số sao không hợp lệ (1-5)!",
        });
      }

      if (typeof content !== 'string' || content.trim().length < 1 || content.trim().length > 255) {
        return res.json({
          success: false,
          message: "Nội dung đánh giá không được để trống!",
        });
      }

      // LẤY ĐƠN HÀNG ĐẦU TIÊN CHƯA ĐÁNH GIÁ
      const orderDetail = await ReviewModel.getFirstUnreviewedOrder(
        maKhachHang,
        productId
      );

      if (!orderDetail) {
        return res.json({
          success: false,
          message: "Bạn cần một đơn đã giao và chưa đánh giá sản phẩm này.",
        });
      }

      // KIỂM TRA LẠI ĐƠN HÀNG NÀY ĐÃ ĐÁNH GIÁ CHƯA
      const hasReviewed = await ReviewModel.checkReviewByOrder(
        orderDetail.maDonHang,
        productId
      );

      if (hasReviewed) {
        return res.json({
          success: false,
          message: "Đơn hàng này đã được đánh giá rồi!",
        });
      }

      // Tạo đánh giá mới
      const maDanhGia = ReviewModel.generateReviewId();
      const ngayDanhGia = new Date().toISOString().split("T")[0];

      await ReviewModel.createReview(
        maDanhGia,
        content.trim(),
        parseInt(star),
        ngayDanhGia,
        orderDetail.maChiTiet
      );

      return res.json({
        success: true,
        userName: userName,
        message: "Đánh giá thành công!",
        orderId: orderDetail.maDonHang,
      });
    } catch (err) {
      console.error(" LỖI THÊM ĐÁNH GIÁ:", err.code || err.message);
      return res.json({
        success: false,
        message: err.status ? err.message : 'Không thể xử lý đánh giá. Vui lòng thử lại.',
      });
    }
  }

  // LẤY DANH SÁCH ĐÁNH GIÁ
  static async getReviews(req, res) {
    try {
      const productId = req.params.maSanPham;

      if (!productId) {
        return res.json({
          success: false,
          message: "Thiếu mã sản phẩm!",
        });
      }

      const reviews = await ReviewModel.getReviewsByProduct(productId);

      return res.json({
        success: true,
        reviews,
      });
    } catch (err) {
      return res.json({
        success: false,
        message: "Lỗi server: " + err.message,
      });
    }
  }

  // LẤY THỐNG KÊ ĐÁNH GIÁ
  static async getReviewStats(req, res) {
    try {
      const productId = req.params.maSanPham;

      if (!productId) {
        return res.json({
          success: false,
          message: "Thiếu mã sản phẩm!",
        });
      }

      const stats = await ReviewModel.getReviewStats(productId);

      return res.json({
        success: true,
        stats,
      });
    } catch (err) {
      return res.json({
        success: false,
        message: "Lỗi server: " + err.message,
      });
    }
  }

  // KIỂM TRA CÓ THỂ ĐÁNH GIÁ KHÔNG
  static async checkCanReview(req, res) {
    try {
      const { maSanPham } = req.params;

      if (!req.session.user) {
        return res.json({
          canReview: false,
          message: "Vui lòng đăng nhập!",
        });
      }

      const maKhachHang = req.session.user.maKhachHang;

      // Lấy danh sách đơn hàng
      const orders = await ReviewModel.getCompletedOrdersWithProduct(
        maKhachHang,
        maSanPham
      );

      // Đếm số đơn chưa đánh giá
      const unreviewedOrders = orders.filter((o) => o.daReview === 0);

      return res.json({
        canReview: unreviewedOrders.length > 0,
        totalOrders: orders.length,
        unreviewedCount: unreviewedOrders.length,
        reviewedCount: orders.length - unreviewedOrders.length,
      });
    } catch (err) {
      return res.json({
        success: false,
        message: "Lỗi server: " + err.message,
      });
    }
  }
}

module.exports = ReviewController;
