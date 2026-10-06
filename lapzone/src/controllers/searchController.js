const Product = require('../models/SPModel');
const KHModel = require('../models/KHModel');

exports.searchProducts = async (req, res) => {
  try {
    // Lấy input từ query
    const filters = {
      keyword: typeof req.query.keyword === "string" ? req.query.keyword.trim() : "",
      brand: req.query.brand || "",
      category: req.query.category || "",
      cpu: req.query.cpu || "",
      ram: req.query.ram || "",
      storage: req.query.storage || "",
      size: req.query.size || "",      // '13-14' | '14-15' | '15+'
      resolution: req.query.resolution || "",
      minPrice: parseFloat(req.query.minPrice) || 0,
      maxPrice: parseFloat(req.query.maxPrice) || 9999999999,
      sort: req.query.sort || ""       // 'price_asc' | 'price_desc'
    };

    // Lấy sản phẩm từ DB, model sẽ handle filter size & price
    let products = await Product.searchWithFilters(filters);

    // Lấy thông tin khách hàng
    let khachHang = null;
    const user = req.session?.user;
    if (user) {
      try {
        const kh = await KHModel.findByUsername(user.id);
        khachHang = kh || {};
      } catch (err) {
        console.error('Lỗi khi lấy thông tin khách hàng:', err);
      }
    }

    // Render EJS
    res.render('resultSearch', {
      products,
      keyword: filters.keyword,
      filters,
      khachHang
    });

  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    res.status(500).send('Lỗi server');
  }
};
