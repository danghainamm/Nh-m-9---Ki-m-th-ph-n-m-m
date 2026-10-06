const db = require('../config/db');

const OrderModel = {
  // Thêm đơn hàng mới
  createOrder: async (order) => {
    const {
      maDonHang,
      ngayDatHang,
      tongGiaTri,
      trangThai,
      phuongThucThanhToan,
      ghiChu,
      maKhachHang,
      maDiaChi
    } = order;

    const sql = `
      INSERT INTO DonHang (maDonHang, ngayDatHang, tongGiaTri, trangThai, phuongThucThanhToan, ghiChu, maKhachHang, maDiaChi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.execute(sql, [
      maDonHang,
      ngayDatHang,
      tongGiaTri,
      trangThai,
      phuongThucThanhToan,
      ghiChu,
      maKhachHang,
      maDiaChi
    ]);
    return order;
  },

  getOrderById: async (maDonHang) => {
    const [rows] = await db.execute(
      'SELECT * FROM DonHang WHERE maDonHang = ?',
      [maDonHang]
    );
    return rows[0];
  }
};

module.exports = OrderModel;
