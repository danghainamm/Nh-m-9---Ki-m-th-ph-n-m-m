const db = require('../config/db');

class KhoModel {
  // Lấy tất cả sản phẩm trong kho
  static async getAllProducts() {
    const query = `
      SELECT
        sp.maSanPham,
        sp.tenSanPham,
        sp.thuongHieu as model,
        sp.giaNhap,
        sp.giaBan,
        sp.tinhTrang,
        sp.soLuongTon,
        (sp.giaNhap * sp.soLuongTon) as tongGiaTri,
        COALESCE(sold.daBan, 0) as daBan,
        sold.ngayNhap
      FROM SanPham sp
      LEFT JOIN (
        SELECT
          ctdh.maSanPham,
          SUM(ctdh.soLuong) as daBan,
          MIN(dh.ngayDatHang) as ngayNhap
        FROM ChiTietDonHang ctdh
        JOIN DonHang dh ON ctdh.maDonHang = dh.maDonHang
        WHERE dh.trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng')
        GROUP BY ctdh.maSanPham
      ) sold ON sp.maSanPham = sold.maSanPham
      ORDER BY sp.maSanPham DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  // Tìm kiếm sản phẩm trong kho
  static async searchProducts(keyword) {
    const query = `
      SELECT
        sp.maSanPham,
        sp.tenSanPham,
        sp.thuongHieu as model,
        sp.giaNhap,
        sp.giaBan,
        sp.tinhTrang,
        sp.soLuongTon,
        (sp.giaNhap * sp.soLuongTon) as tongGiaTri,
        COALESCE(sold.daBan, 0) as daBan,
        sold.ngayNhap
      FROM SanPham sp
      LEFT JOIN (
        SELECT
          ctdh.maSanPham,
          SUM(ctdh.soLuong) as daBan,
          MIN(dh.ngayDatHang) as ngayNhap
        FROM ChiTietDonHang ctdh
        JOIN DonHang dh ON ctdh.maDonHang = dh.maDonHang
        WHERE dh.trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng')
        GROUP BY ctdh.maSanPham
      ) sold ON sp.maSanPham = sold.maSanPham
      WHERE sp.maSanPham LIKE ?
         OR sp.tenSanPham LIKE ?
         OR sp.thuongHieu LIKE ?
      ORDER BY sp.maSanPham DESC
    `;
    const searchTerm = `%${keyword}%`;
    const [rows] = await db.execute(query, [searchTerm, searchTerm, searchTerm]);
    return rows;
  }

  // Lấy thông tin chi tiết một sản phẩm
  static async getProductById(maSP) {
    const query = `
      SELECT
        sp.maSanPham,
        sp.tenSanPham,
        sp.thuongHieu as model,
        sp.giaNhap,
        sp.giaBan,
        sp.tinhTrang,
        sp.soLuongTon,
        (sp.giaNhap * sp.soLuongTon) as tongGiaTri,
        COALESCE(sold.daBan, 0) as daBan
      FROM SanPham sp
      LEFT JOIN (
        SELECT
          ctdh.maSanPham,
          SUM(ctdh.soLuong) as daBan
        FROM ChiTietDonHang ctdh
        JOIN DonHang dh ON dh.maDonHang = ctdh.maDonHang
        WHERE dh.trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng')
        GROUP BY ctdh.maSanPham
      ) sold ON sp.maSanPham = sold.maSanPham
      WHERE sp.maSanPham = ?
    `;
    const [rows] = await db.execute(query, [maSP]);
    return rows[0];
  }

  // Cập nhật thông tin sản phẩm trong kho
  static async updateProduct(maSP, data) {
    const query = `
      UPDATE SanPham
      SET tinhTrang = ?, soLuongTon = ?
      WHERE maSanPham = ?
    `;
    const [result] = await db.execute(query, [
      data.tinhTrang,
      data.soLuongTon,
      maSP
    ]);
    return result;
  }

  // Nhập hàng (tăng tồn kho)
  static async importStock(maSP, soLuong) {
    const query = `
      UPDATE SanPham
      SET soLuongTon = soLuongTon + ?
      WHERE maSanPham = ?
    `;
    const [result] = await db.execute(query, [soLuong, maSP]);
    return result;
  }

  // Xuất hàng (giảm tồn kho)
  static async exportStock(maSP, soLuong) {
    const query = `
      UPDATE SanPham
      SET soLuongTon = soLuongTon - ?
      WHERE maSanPham = ? AND soLuongTon >= ?
    `;
    const [result] = await db.execute(query, [soLuong, maSP, soLuong]);
    return result;
  }

  // Lấy thống kê tổng quan kho
  static async getStatistics() {
    const query = `
      SELECT
        COUNT(*) as tongSanPham,
        SUM(soLuongTon) as tongTonKho,
        SUM(CASE WHEN soLuongTon > 0 THEN 1 ELSE 0 END) as soLuongConHang,
        SUM(CASE WHEN soLuongTon = 0 THEN 1 ELSE 0 END) as soLuongHetHang,
        SUM(CASE WHEN soLuongTon < 10 THEN 1 ELSE 0 END) as sanPhamSapHet,
        COALESCE(SUM(giaNhap * soLuongTon), 0) as tongGiaTriKho
      FROM SanPham
    `;
    const [rows] = await db.execute(query);
    return rows[0];
  }

  // Lấy sản phẩm sắp hết hàng
  static async getLowStockProducts(limit = 10) {
    const query = `
      SELECT
        maSanPham,
        tenSanPham,
        thuongHieu as model,
        soLuongTon,
        tinhTrang,
        giaNhap,
        (giaNhap * soLuongTon) as tongGiaTri
      FROM SanPham
      WHERE soLuongTon < 10 AND soLuongTon > 0
      ORDER BY soLuongTon ASC
      LIMIT ?
    `;
    const [rows] = await db.query(query, [Number(limit)]);
    return rows;
  }
}

module.exports = KhoModel;
