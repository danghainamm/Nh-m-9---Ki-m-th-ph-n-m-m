const db = require("../config/db");

class ReviewModel {
  // LẤY CHI TIẾT ĐƠN HÀNG THEO MÃ ĐơN HÀNG
  static async getOrderDetailByOrder(maDonHang, maSanPham) {
    try {
      const query = `
        SELECT ct.maChiTiet, dh.trangThai
        FROM ChiTietDonHang ct
        JOIN DonHang dh ON ct.maDonHang = dh.maDonHang
        WHERE ct.maDonHang = ?
          AND ct.maSanPham = ?
          AND dh.trangThai IN ('Đã giao', 'Đã giao hàng', 'Hoàn thành')
        LIMIT 1
      `;

      const [rows] = await db.query(query, [maDonHang, maSanPham]);
      return rows.length > 0 ? rows[0].maChiTiet : null;
    } catch (err) {
      throw err;
    }
  }

  // KIỂM TRA ĐƠN HÀNG ĐÃ ĐÁNH GIÁ SẢN PHẨM NÀY CHƯA
  static async checkReviewByOrder(maDonHang, maSanPham) {
    try {
      const query = `
        SELECT dg.maDanhGia
        FROM DanhGia dg
        JOIN ChiTietDonHang ct ON dg.maChiTiet = ct.maChiTiet
        WHERE ct.maDonHang = ? AND ct.maSanPham = ?
      `;
      const [results] = await db.query(query, [maDonHang, maSanPham]);
      return results.length > 0;
    } catch (err) {
      throw err;
    }
  }

  // LẤY DANH SÁCH ĐƠN HÀNG ĐÃ HOÀN THÀNH CÓ SẢN PHẨM NÀY
  static async getCompletedOrdersWithProduct(maKhachHang, maSanPham) {
    try {
      const query = `
        SELECT DISTINCT
          dh.maDonHang,
          dh.ngayDatHang,
          ct.maChiTiet,
          CASE
            WHEN dg.maDanhGia IS NOT NULL THEN 1
              ELSE 0
          END
           as daReview
        FROM DonHang dh
        JOIN ChiTietDonHang ct ON dh.maDonHang = ct.maDonHang
        LEFT JOIN DanhGia dg ON ct.maChiTiet = dg.maChiTiet AND ct.maSanPham = ?
        WHERE dh.maKhachHang = ?
          AND ct.maSanPham = ?
          AND dh.trangThai IN ('Đã giao', 'Đã giao hàng', 'Hoàn thành')
        ORDER BY dh.ngayDatHang DESC
      `;

      const [rows] = await db.query(query, [maSanPham, maKhachHang, maSanPham]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // LẤY CHI TIẾT ĐƠN HÀNG ĐẦU TIÊN CHƯA ĐÁNH GIÁ
  static async getFirstUnreviewedOrder(maKhachHang, maSanPham) {
    try {
      const query = `
        SELECT ct.maChiTiet, dh.maDonHang
        FROM ChiTietDonHang ct
        JOIN DonHang dh ON ct.maDonHang = dh.maDonHang
        LEFT JOIN DanhGia dg ON ct.maChiTiet = dg.maChiTiet
        WHERE dh.maKhachHang = ?
          AND ct.maSanPham = ?
          AND dh.trangThai IN ('Đã giao', 'Đã giao hàng', 'Hoàn thành')
          AND dg.maDanhGia IS NULL
        ORDER BY dh.ngayDatHang DESC
        LIMIT 1
      `;

      const [rows] = await db.query(query, [maKhachHang, maSanPham]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      throw err;
    }
  }

  //THÊM ĐÁNH GIÁ MỚI
  static async createReview(maDanhGia, noiDung, soSao, ngayDanhGia, maChiTiet) {
    return require('../services/checkout').transaction(async connection => {
      await connection.query('SELECT maChiTiet FROM ChiTietDonHang WHERE maChiTiet = ? FOR UPDATE', [maChiTiet]);
      const [existing] = await connection.query('SELECT maDanhGia FROM DanhGia WHERE maChiTiet = ?', [maChiTiet]);
      if (existing.length) throw require('../utils/validation').fail('Đơn hàng này đã được đánh giá.', 409);
      const [result] = await connection.query('INSERT INTO DanhGia (maDanhGia, noiDung, soSao, ngayDanhGia, maChiTiet) VALUES (?, ?, ?, ?, ?)', [maDanhGia, noiDung, soSao, ngayDanhGia, maChiTiet]);
      return result;
    });
  }

  // LẤY DANH SÁCH ĐÁNH GIÁ THEO SẢN PHẨM
  static async getReviewsByProduct(maSanPham) {
    try {
      const query = `
        SELECT
          dg.maDanhGia,
          dg.noiDung,
          dg.soSao,
          dg.ngayDanhGia,
          kh.hoTen as tenKhachHang,
          dh.maDonHang
        FROM DanhGia dg
        JOIN ChiTietDonHang ct ON dg.maChiTiet = ct.maChiTiet
        JOIN DonHang dh ON ct.maDonHang = dh.maDonHang
        JOIN KhachHang kh ON dh.maKhachHang = kh.maKhachHang
        WHERE ct.maSanPham = ?
        ORDER BY dg.ngayDanhGia DESC
      `;

      const [results] = await db.query(query, [maSanPham]);
      return results;
    } catch (err) {
      throw err;
    }
  }

  // THỐNG KÊ ĐÁNH GIÁ
  static async getReviewStats(maSanPham) {
    try {
      const query = `
        SELECT
          COALESCE(COUNT(*), 0) as totalReviews,
          COALESCE(AVG(dg.soSao), 0) as avgStar,
          COALESCE(SUM(CASE WHEN dg.soSao = 5 THEN 1 ELSE 0 END), 0) as star5,
          COALESCE(SUM(CASE WHEN dg.soSao = 4 THEN 1 ELSE 0 END), 0) as star4,
          COALESCE(SUM(CASE WHEN dg.soSao = 3 THEN 1 ELSE 0 END), 0) as star3,
          COALESCE(SUM(CASE WHEN dg.soSao = 2 THEN 1 ELSE 0 END), 0) as star2,
          COALESCE(SUM(CASE WHEN dg.soSao = 1 THEN 1 ELSE 0 END), 0) as star1
        FROM DanhGia dg
        JOIN ChiTietDonHang ct ON dg.maChiTiet = ct.maChiTiet
        WHERE ct.maSanPham = ?
      `;

      const [results] = await db.query(query, [maSanPham]);

      return {
        totalReviews: parseInt(results[0]?.totalReviews) || 0,
        avgStar: parseFloat(results[0]?.avgStar) || 0,
        star5: parseInt(results[0]?.star5) || 0,
        star4: parseInt(results[0]?.star4) || 0,
        star3: parseInt(results[0]?.star3) || 0,
        star2: parseInt(results[0]?.star2) || 0,
        star1: parseInt(results[0]?.star1) || 0,
      };
    } catch (err) {
      throw err;
    }
  }

  // TẠO MÃ ĐÁNH GIÁ
  static generateReviewId() {
    return require('crypto').randomUUID();
  }
}

module.exports = ReviewModel;
