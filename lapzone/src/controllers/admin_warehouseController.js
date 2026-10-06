const KhoModel = require('../models/khoModel');

class KhoController {
  // Hiển thị trang quản lý kho
  static async showKhoPage(req, res) {
    try {
      const products = await KhoModel.getAllProducts();
      const statistics = await KhoModel.getStatistics();
      const lowStockProducts = await KhoModel.getLowStockProducts(5);

      res.render('admin_warehouse', {
        quanTriVien: req.session.user,
        products: products,
        statistics: statistics,
        lowStockProducts: lowStockProducts,
        message: req.query.message || null
      });
    } catch (error) {
      console.error('Lỗi khi tải trang kho:', error);
      res.status(500).send('Lỗi server: ' + error.message);
    }
  }

  // Tìm kiếm sản phẩm
  static async searchProducts(req, res) {
    try {
      const keyword = req.query.keyword || '';
      const products = keyword
        ? await KhoModel.searchProducts(keyword)
        : await KhoModel.getAllProducts();

      const statistics = await KhoModel.getStatistics();
      const lowStockProducts = await KhoModel.getLowStockProducts(5);


      res.render('admin_warehouse', {
        quanTriVien: req.session.user,
        products: products,
        statistics: statistics,
        lowStockProducts: lowStockProducts,
        keyword: keyword
      });
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      res.status(500).send('Lỗi server');
    }
  }

  // Cập nhật thông tin sản phẩm
  static async updateProduct(req, res) {
    try {
      const { maSP } = req.params;
      const { tinhTrang, soLuongTon } = req.body;

      if (!Number.isSafeInteger(Number(soLuongTon)) || Number(soLuongTon) < 0) return res.status(400).send('Tồn kho phải là số nguyên không âm.');
      await KhoModel.updateProduct(maSP, {
        tinhTrang,
        soLuongTon: parseInt(soLuongTon)
      });

      res.redirect('/quanlykho?message=Cập nhật thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      res.redirect('/quanlykho?message=Lỗi: Không thể cập nhật');
    }
  }

  // Nhập hàng
  static async importStock(req, res) {
    try {
      const { maSP, soLuong } = req.body;

      if (!maSP || !require('../utils/validation').quantity(soLuong)) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ'
        });
      }

      const result = await KhoModel.importStock(maSP, Number(soLuong));
      if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
      res.json({ success: true, message: 'Nhập hàng thành công' });
    } catch (error) {
      console.error('Lỗi khi nhập hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi nhập hàng' });
    }
  }

  // Xuất hàng
  static async exportStock(req, res) {
    try {
      const { maSP, soLuong } = req.body;

      if (!maSP || !require('../utils/validation').quantity(soLuong)) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ'
        });
      }

      const result = await KhoModel.exportStock(maSP, parseInt(soLuong));

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng tồn kho không đủ'
        });
      }

      res.json({ success: true, message: 'Xuất hàng thành công' });
    } catch (error) {
      console.error('Lỗi khi xuất hàng:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi xuất hàng' });
    }
  }

  // Lấy thống kê kho (API)
  static async getStatistics(req, res) {
    try {
      const statistics = await KhoModel.getStatistics();
      const lowStockProducts = await KhoModel.getLowStockProducts(10);

      res.json({
        success: true,
        data: {
          statistics,
          lowStockProducts
        }
      });
    } catch (error) {
      console.error('Lỗi khi lấy thống kê:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }
}

module.exports = KhoController;
