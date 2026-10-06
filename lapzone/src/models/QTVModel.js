// /models/QTVModel.js
const db = require("../config/db");

// Tìm kiếm Quản trị viên theo tên đăng nhập
async function findByUsername(username) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM QuanTriVien WHERE tenDangNhap = ?",
      [username]
    );
    return rows[0] || null;
  } catch (error) {
    console.error(" Lỗi QTVModel.findByUsername:", error);
    throw error;
  }
}

//Tìm kiếm Quản trị viên theo ID
async function findById(id) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM QuanTriVien WHERE maQuanTriVien = ?",
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Lỗi QTVModel.findById:", error);
    throw error;
  }
}

module.exports = {
  findByUsername,
  findById,
};