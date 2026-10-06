
const db = require("../config/db");

const generateNewCartId = () => {
  return "GH" + Date.now().toString().slice(-6);
};

class CartModel {
  /*Hàm lấy/tạo ID Giỏ hàng*/
  static async getCartIdByCustomerId(maKhachHang) {
    const selectSql = `SELECT maGioHang FROM GioHang WHERE maKhachHang = ?`;
    const [rows] = await db.query(selectSql, [maKhachHang]);
    if (rows.length > 0) {
      return rows[0].maGioHang;
    }

    // Giỏ hàng CHƯA tồn tại -> TẠO MỚI
    const newMaGioHang = generateNewCartId();
    const insertSql = `INSERT INTO GioHang (maGioHang, tongTien, maKhachHang) VALUES (?, 0, ?)`;

    await db.query(insertSql, [newMaGioHang, maKhachHang]);
    console.log(
      `[DB] Đã tạo Giỏ hàng mới: ${newMaGioHang} cho KH: ${maKhachHang}`
    );

    return newMaGioHang;
  } // 1. Lấy chi tiết Giỏ hàng

  static async getCartDetailsByCustomerId(maKhachHang) {
    const sql = `
SELECT 
    ct.SanPhammaSanPham AS maSanPham, 
    sp.tenSanPham, 
    sp.giaBan AS DonGia, 
    sp.anhMinhHoaSP,
    ct.soLuong
FROM 
    KhachHang kh
JOIN 
    GioHang gh ON kh.maKhachHang = gh.maKhachHang
JOIN 
    ChiTietGioHang ct ON gh.maGioHang = ct.GioHangmaGioHang
JOIN 
    SanPham sp ON ct.SanPhammaSanPham = sp.maSanPham
WHERE 
    kh.maKhachHang = ?;
`;
    const [rows] = await db.query(sql, [maKhachHang]);
    return rows;
  } // 2. Thêm sản phẩm

  static async addProductToCart(maKhachHang, maSanPham, soLuong) {
    const maGioHang = await this.getCartIdByCustomerId(maKhachHang);

    const checkSql = `
SELECT soLuong FROM ChiTietGioHang 
WHERE GioHangmaGioHang = ? AND SanPhammaSanPham = ?
`;
    const [existingItem] = await db.query(checkSql, [maGioHang, maSanPham]);

    if (existingItem.length > 0) {
      // Cập nhật số lượng
      const newQuantity = existingItem[0].soLuong + soLuong;
      const updateSql = `
UPDATE ChiTietGioHang SET soLuong = ? 
WHERE GioHangmaGioHang = ? AND SanPhammaSanPham = ?
`;
      await db.query(updateSql, [newQuantity, maGioHang, maSanPham]);
    } else {
      // Thêm mới
      const insertSql = `
INSERT INTO ChiTietGioHang (SanPhammaSanPham, GioHangmaGioHang, soLuong) 
VALUES (?, ?, ?)
`;
      await db.query(insertSql, [maSanPham, maGioHang, soLuong]);
    }
  }

  // 3. Cập nhật số lượng
  static async updateItemQuantity(maKhachHang, maSanPham, newQuantity) {
    const maGioHang = await this.getCartIdByCustomerId(maKhachHang);
    if (!maGioHang) return { message: "Không tìm thấy giỏ hàng." };

    const updateSql = `
UPDATE ChiTietGioHang 
SET soLuong = ? 
WHERE GioHangmaGioHang = ? AND SanPhammaSanPham = ?
`;
    await db.query(updateSql, [newQuantity, maGioHang, maSanPham]);
  } // 4. Xóa sản phẩm

  static async removeItemFromCart(maKhachHang, maSanPham) {
    const maGioHang = await this.getCartIdByCustomerId(maKhachHang);
    if (!maGioHang) return { message: "Không tìm thấy giỏ hàng." };

    const sql = `
DELETE FROM ChiTietGioHang 
WHERE GioHangmaGioHang = ? AND SanPhammaSanPham = ?
`;
    await db.query(sql, [maGioHang, maSanPham]);
    return { message: "Xóa sản phẩm khỏi giỏ." };
  }
}

module.exports = CartModel;
