const productModel = require("../models/SPModel");
const KHModel = require("../models/KHModel");
function validateProduct(data) {
  const { text, fail } = require('../utils/validation');
  if (!text(data.tenSanPham) || !text(data.maDanhMuc) || !Number.isFinite(Number(data.giaBan)) || Number(data.giaBan) <= 0 || !Number.isSafeInteger(Number(data.soLuongTon)) || Number(data.soLuongTon) < 0 || !Number.isFinite(Number(data.giaNhap || 0)) || Number(data.giaNhap || 0) < 0) throw fail('Tên, danh mục, giá bán và tồn kho không hợp lệ.');
  if (data.maSanPham && !/^[A-Za-z0-9_-]{1,64}$/.test(data.maSanPham)) throw fail('Mã sản phẩm chỉ dùng chữ, số, dấu gạch ngang hoặc gạch dưới.');
  for (const value of Object.values(data)) if (typeof value !== 'string' && typeof value !== 'number' || String(value).length > 255) throw fail('Thông tin sản phẩm vượt giới hạn hoặc sai định dạng.');
  if (data.anhMinhHoaSP && !/^(\/images\/|https?:\/\/)/.test(data.anhMinhHoaSP)) throw fail('Ảnh phải là đường dẫn /images/ hoặc URL http(s).');
}
const reportModel = require("../models/reportModel");

// Public: view product detail
exports.getProductDetail = async (req, res) => {
  try {
    const maSanPham = req.params.maSanPham;
    const sanPham = await productModel.findById(maSanPham);
    if (!sanPham) return res.status(404).send("Không tìm thấy sản phẩm");
    let khachHang = null;
    const user = req.session?.user;
    if (user) {
      khachHang = await KHModel.findByUsername(user.id);
    }
    res.render("product", { sanPham, khachHang });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error.code || error.message);
    res.status(500).send("Lỗi server");
  }
};

// Admin: list all products
exports.listProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    let products;
    if (keyword) {
      products = await productModel.searchProducts(keyword);
    } else {
      products = await productModel.findAllProducts();
    }
    res.render("product_list", {
      products,
      quanTriVien: req.session?.user,
      keyword,
    });
  } catch (err) {
    console.error("Error listing products:", err.code || err.message);
    res.status(500).send("Lỗi server");
  }
};

// Admin: show create form
exports.showCreateForm = async (req, res) => {
  try {
    const categories = await productModel.findAllCategories();
    res.render("product_form", {
      product: null,
      categories,
      action: "/quanlysanpham/create",
      method: "POST",
      quanTriVien: req.session?.user,
    });
  } catch (err) {
    console.error("Error showing create form:", err.code || err.message);
    res.status(500).send("Lỗi server");
  }
};

// Admin: create product
exports.createProduct = async (req, res) => {
  try {

    const { maSanPham, tenSanPham, giaBan, maDanhMuc } = req.body;
    if (!maSanPham || !tenSanPham || !giaBan || !maDanhMuc) {
      return res
        .status(400)
        .send(
          "Vui lòng điền đầy đủ các trường bắt buộc (Mã SP, Tên SP, Giá, Danh mục)"
        );
    }

    // Kiểm tra mã sản phẩm trùng
    const exists = await productModel.checkProductExists(maSanPham);
    if (exists) {
      const categories = await productModel.findAllCategories();
      return res.render("product_form", {
        product: req.body, // Giữ lại dữ liệu đã nhập
        categories,
        action: "/quanlysanpham/create",
        method: "POST",
        quanTriVien: req.session?.user,
        errorMessage: "Mã sản phẩm đã tồn tại!",
        isCreateError: true,
      });
    }

    validateProduct(req.body);
    await productModel.createProduct(req.body);
    res.redirect("/quanlysanpham");
  }

  catch (err) {
    console.error("Error creating product:", err.code || err.message);
    res.status(err.status || 500).send(err.status ? err.message : "Không thể lưu sản phẩm.");
  }
};

// Admin: show edit form
exports.showEditForm = async (req, res) => {
  try {
    const [product, categories] = await Promise.all([
      productModel.findById(req.params.maSanPham),
      productModel.findAllCategories(),
    ]);

    if (!product) return res.status(404).send("Không tìm thấy sản phẩm");
    res.render("product_form", {
      product,
      categories,
      action: `/quanlysanpham/edit/${req.params.maSanPham}`,
      method: "POST",
      quanTriVien: req.session?.user,
    });
  } catch (err) {
    console.error("Error loading edit form:", err.code || err.message);
    res.status(500).send("Lỗi server");
  }
};

// Admin: update product
exports.updateProduct = async (req, res) => {
  try {
    const { tenSanPham, giaBan, maDanhMuc } = req.body;
    if (!tenSanPham || !giaBan || !maDanhMuc) {
      return res
        .status(400)
        .send(
          "Vui lòng điền đầy đủ các trường bắt buộc (Tên SP, Giá, Danh mục)"
        );
    }
    validateProduct(req.body);
    if (!await productModel.checkProductExists(req.params.maSanPham)) return res.status(404).send("Không tìm thấy sản phẩm.");
    await productModel.updateProduct(req.params.maSanPham, req.body);
    res.redirect("/quanlysanpham");
  } catch (err) {
    console.error("Error updating product:", err.code || err.message);
    res.status(err.status || 500).send(err.status ? err.message : "Không thể lưu sản phẩm.");
  }
};

// Admin: delete product
exports.deleteProduct = async (req, res) => {
  try {
    await productModel.deleteProduct(req.params.maSanPham);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err.code || err.message);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : "Không thể xóa sản phẩm." });
  }
};

// Admin: product statistics report
exports.showReport = async (req, res) => {
  try {
    let { year, month, week, date, weekInput, monthInput, yearInput } = req.query;
    let filters = { year, month, week, date, weekInput, monthInput, yearInput };

    // Handle Inline Inputs
    if (date) {
      // If date is selected, we might want to show Daily Revenue for that specific date
      // OR the week/month containing it.
      // For now, let's pass 'date' to the model.
      filters.date = date;
    }

    if (weekInput) {
      // weekInput format: "2025-W51"
      const parts = weekInput.split('-W');
      if (parts.length === 2) {
        filters.year = parts[0];
        filters.week = parts[1];
      }
    }

    if (monthInput) {
      // monthInput format: "2025-12"
      const parts = monthInput.split('-');
      if (parts.length === 2) {
        filters.year = parts[0];
        filters.month = parts[1];
      }
    }

    if (yearInput) {
      filters.year = yearInput;
      filters.yearInput = yearInput;
    }

    const stats = await reportModel.getReportStats(filters);
    res.render("product_report", {
      stats,
      filters, // Pass raw filters to keep UI state if needed
      quanTriVien: req.session?.user,
    });
  } catch (err) {
    console.error("Error generating report:", err.code || err.message);
    res.status(500).send("Lỗi server");
  }
};

// Public: view products by category
exports.viewProductByCategorie = async (req, res) => {
  try {
    const maDanhMuc = req.params.maDanhMuc;

    // Lấy danh sách sản phẩm theo danh mục
    const sanPham = await productModel.viewProductByCategorie(maDanhMuc);

    // Lấy danh sách danh mục để hiển thị tên danh mục
    const danhMuc = await productModel.findAllCategories();

    const tenDanhMuc =
      danhMuc.find((dm) => dm.maDanhMuc == maDanhMuc)?.tenDanhMuc || "Danh mục";

    // Lấy thông tin khách hàng (nếu đã đăng nhập)
    let khachHang = null;
    const user = req.session?.user;
    if (user) {
      khachHang = await KHModel.findByUsername(user.id);
    }

    // Render ra EJS giao diện
    res.render("productsByCategory", {
      sanPham,
      tenDanhMuc,
      danhMuc,
      khachHang,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error.code || error.message);
    res.status(500).send("Lỗi server");
  }
};
// Public: show product review page
exports.showProductReviewPage = async (req, res) => {
  try {
    const maSanPham = req.params.maSanPham;
    // Lấy thông tin sản phẩm
    const sanPham = await productModel.findById(maSanPham);
    if (!sanPham) return res.status(404).send("Không tìm thấy sản phẩm");
    // Lấy thông tin khách hàng nếu đã login
    let khachHang = null;
    const user = req.session?.user;
    if (user) {
      khachHang = await KHModel.findByUsername(user.id);
    }
    // Render trang roductReview.ejs
    res.render("productReview", { sanPham, khachHang });
  } catch (error) {
    console.error("Lỗi khi mở trang đánh giá:", error.code || error.message);
    res.status(500).send("Lỗi server");
  }
};
