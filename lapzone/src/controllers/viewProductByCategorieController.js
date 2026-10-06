const productModel = require('../models/SPModel');


exports.showProductsByCategory = async (req, res) => {
  const { maDanhMuc } = req.params;

  try {
    // Lấy danh mục để hiển thị tiêu đề
    const categories = await productModel.findAllCategories();
    const currentCategory = categories.find(c => c.maDanhMuc == maDanhMuc);

    // Lấy sản phẩm theo danh mục
    const products = await productModel.viewProductByCategorie(maDanhMuc);

    res.render("productsByCategory", {
      products,
      currentCategory,
      categories
    });

  } catch (error) {
    console.error("Lỗi Controller showProductsByCategory:", error);
    res.status(500).send("Lỗi server");
  }
};
