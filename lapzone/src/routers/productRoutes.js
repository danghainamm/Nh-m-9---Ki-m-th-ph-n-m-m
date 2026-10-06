const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

function checkAdminAuth(req, res, next) {
  if (
    !req.session ||
    !req.session.user ||
    req.session.user.userType !== "qtv"
  ) {
    return res.redirect("/");
  }
  next();
}

const requireAuth = require('../middleware/auth').requireAdmin;

// ----------------- ADMIN ROUTES -----------------
router.get("/", requireAuth, productController.listProducts);
router.get("/report", requireAuth, productController.showReport);
router.get("/create", requireAuth, productController.showCreateForm);
router.post("/create", requireAuth, productController.createProduct);
router.get("/edit/:maSanPham", requireAuth, productController.showEditForm);
router.post("/edit/:maSanPham", requireAuth, productController.updateProduct);
router.delete("/:maSanPham", requireAuth, productController.deleteProduct);

router.get("/category/:maDanhMuc", productController.viewProductByCategorie);
router.get(
  "/review-product/:maSanPham",
  productController.showProductReviewPage
);

router.get("/:maSanPham", productController.getProductDetail);

module.exports = router;
