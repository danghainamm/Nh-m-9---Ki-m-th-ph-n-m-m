// src/controllers/homeController.js

const KHModel = require("../models/KHModel");
const SPModel = require("../models/SPModel");
const DMModel = require("../models/DMModel");

// ================Khách hàng =======================
const getDashboardKhachHang = async (req, res) => {
  try {
    const user = req.session.user;

    let khachHang = null;
    // Lấy thông tin khách hàng
    if (user && user.id) {
      khachHang = await KHModel.findByUsername(user.id);
    //   const khachHang = await KHModel.findById(user.id);
    }

    // Lấy danh sách danh mục
    const danhMuc = await DMModel.findAllCategories();
    // Lấy danh sách sản phẩm
    const sanPham = await SPModel.findAllProducts();


    // Render view và truyền cả 3 dữ liệu
    res.render("dashboard_kh", { khachHang, sanPham, danhMuc });
  } catch (error) {
    console.error("Lỗi trong getDashboardKhachHang:", error);
    res.status(500).send("Lỗi máy chủ nội bộ");
  }
};

// ============ QTV ================================
const QTVModel = require("../models/QTVModel");

const getDashboardQTV = async (req, res) => {

  const user = req.session.user;
  if (!user) return res.redirect("/login");
  if (user.userType !== "qtv") return res.status(403).send("Bạn không có quyền truy cập.");

  const quanTriVien = await QTVModel.findByUsername(user.id);
  if (!quanTriVien) return res.status(403).send("Tài khoản quản trị không tồn tại.");


  res.render("dashboard_qtv", {
    quanTriVien,
    tenNguoiDung: quanTriVien.hoTen,
  });
};

module.exports = {
  getDashboardKhachHang,
  getDashboardQTV,
};
