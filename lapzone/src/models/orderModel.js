const db = require("../config/db");

const OrderModel = {
  // Lấy tất cả đơn hàng
  getAllOrders: async () => {
    const query = `
      SELECT
        dh.maDonHang,
        dh.ngayDatHang AS ngayTao,
        kh.hoTen as tenKhachHang,
        kh.soDienThoai AS soDienThoai,
        di.hoTenNguoiNhan AS tenNguoiNhan,
        di.soDienThoaiNguoiNhan AS sdtNguoiNhan,
        di.diaChiNhanHang AS diaChiNguoiNhan,
        dh.trangThai,
        dh.phuongThucThanhToan AS trangThaiThanhToan,
        NULL AS trangThaiGiaoHang,
        dh.tongGiaTri AS tongTien
      FROM DonHang dh
      LEFT JOIN KhachHang kh ON dh.maKhachHang = kh.maKhachHang
      LEFT JOIN DiaChi di ON dh.maDiaChi = di.maDiaChi
      ORDER BY dh.ngayDatHang DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // Lấy theo trạng thái
  getOrdersByStatus: async (status) => {
    const query = `
      SELECT
        dh.maDonHang,
        dh.ngayDatHang AS ngayTao,
        kh.hoTen AS tenKhachHang,
        kh.soDienThoai AS soDienThoai,
        di.hoTenNguoiNhan AS tenNguoiNhan,
        di.soDienThoaiNguoiNhan AS sdtNguoiNhan,
        di.diaChiNhanHang AS diaChiNguoiNhan,
        dh.trangThai,
        dh.phuongThucThanhToan AS trangThaiThanhToan,
        NULL AS trangThaiGiaoHang,
        dh.tongGiaTri AS tongTien
      FROM DonHang dh
      JOIN KhachHang kh ON dh.maKhachHang = kh.maKhachHang
      LEFT JOIN DiaChi di ON dh.maDiaChi = di.maDiaChi
      WHERE dh.trangThai IN (?)
      ORDER BY dh.ngayDatHang DESC
    `;
    const states = status === 'Chờ xử lý' ? ['Chờ xử lý', 'Chờ xác nhận'] : [status];
    const [rows] = await db.query(query, [states]);
    return rows;
  },

  // Lấy theo trạng thái thanh toán
  getOrdersByPaymentStatus: async (paymentStatus) => {
    const query = `
      SELECT
        dh.maDonHang,
        dh.ngayDatHang AS ngayTao,
        kh.hoTen AS tenKhachHang,
        kh.soDienThoai AS soDienThoai,
        di.hoTenNguoiNhan AS tenNguoiNhan,
        di.soDienThoaiNguoiNhan AS sdtNguoiNhan,
        di.diaChiNhanHang AS diaChiNguoiNhan,
        dh.trangThai,
        dh.phuongThucThanhToan AS trangThaiThanhToan,
        NULL AS trangThaiGiaoHang,
        dh.tongGiaTri AS tongTien
      FROM DonHang dh
      JOIN KhachHang kh ON dh.maKhachHang = kh.maKhachHang
      LEFT JOIN DiaChi di ON dh.maDiaChi = di.maDiaChi
      WHERE ${paymentStatus === 'Đã thanh toán' ? 'dh.phuongThucThanhToan LIKE ?' : paymentStatus === 'Chờ xử lý' ? "dh.phuongThucThanhToan NOT LIKE ? AND dh.trangThai <> 'Đã hủy'" : 'dh.phuongThucThanhToan = ?'}
      ORDER BY dh.ngayDatHang DESC
    `;
    const [rows] = await db.query(query, [paymentStatus === 'Đã thanh toán' || paymentStatus === 'Chờ xử lý' ? 'Đã thanh toán%' : paymentStatus]);
    return rows;
  },

  // Tìm đơn hàng theo mã đơn hàng hoặc tên khách (loại bỏ dấu # và chuẩn hóa)
  searchOrders: async (keyword) => {
    if (!keyword || !keyword.trim()) {
      return OrderModel.getAllOrders();
    }

    // Loại bỏ ký tự # ở đầu (người dùng thường tìm theo '#MA...' trong UI)
    let clean = keyword.trim();
    if (clean.startsWith('#')) clean = clean.slice(1);

    // Chuẩn hóa khoảng trắng
    clean = clean.replace(/\s+/g, ' ').trim();

    const like = '%' + clean + '%';
    const query = `
      SELECT
        dh.maDonHang,
        dh.ngayDatHang AS ngayTao,
        kh.hoTen as tenKhachHang,        kh.soDienThoai AS soDienThoai,        di.hoTenNguoiNhan AS tenNguoiNhan,
        di.soDienThoaiNguoiNhan AS sdtNguoiNhan,
        di.diaChiNhanHang AS diaChiNguoiNhan,
        dh.trangThai,
        dh.phuongThucThanhToan AS trangThaiThanhToan,
        NULL AS trangThaiGiaoHang,
        dh.tongGiaTri AS tongTien
      FROM DonHang dh
      LEFT JOIN KhachHang kh ON dh.maKhachHang = kh.maKhachHang
      LEFT JOIN DiaChi di ON dh.maDiaChi = di.maDiaChi
      WHERE dh.maDonHang LIKE ? OR kh.hoTen LIKE ?
      ORDER BY dh.ngayDatHang DESC
    `;
    const [rows2] = await db.query(query, [like, like]);
    return rows2;
  },

  // Lấy đơn theo ID
  getOrderById: async (maDonHang) => {
    const query = `
      SELECT
        dh.*,
        kh.hoTen AS tenKhachHang,
        kh.soDienThoai,
        kh.email,
        di.hoTenNguoiNhan AS tenNguoiNhan,
        di.soDienThoaiNguoiNhan AS sdtNguoiNhan,
        di.diaChiNhanHang AS diaChi,
        dh.maDiaChi
      FROM DonHang dh
      JOIN KhachHang kh ON dh.maKhachHang = kh.maKhachHang
      LEFT JOIN DiaChi di ON dh.maDiaChi = di.maDiaChi
      WHERE dh.maDonHang = ?
    `;
    const [rows] = await db.query(query, [maDonHang]);
    return rows;
  },

  // Lấy chi tiết đơn
  getOrderDetails: async (maDonHang) => {
    const query = `
      SELECT
        ctdh.*,
        sp.tenSanPham,
        sp.anhMinhHoaSP AS hinhAnh
      FROM ChiTietDonHang ctdh
      JOIN SanPham sp ON ctdh.maSanPham = sp.maSanPham
      WHERE ctdh.maDonHang = ?
    `;
    const [rows] = await db.query(query, [maDonHang]);
    return rows;
  },

  // ---------- HELPER GỘP ĐƠN ----------
  _groupOrders: (rows) => {
    const ordersMap = new Map();
    rows.forEach((row) => {
      if (!ordersMap.has(row.maDonHang)) {
        ordersMap.set(row.maDonHang, {
          maDonHang: row.maDonHang,
          ngayTao: row.ngayTao,
          trangThai: row.trangThai,
          trangThaiThanhToan: row.trangThaiThanhToan,
          tongTien: Number(row.tongTien),
          products: [],
        });
      }
      if (row.tenSanPham) {
        ordersMap.get(row.maDonHang).products.push({
          maSanPham: row.maSanPham,
          tenSanPham: row.tenSanPham,
          soLuong: row.soLuong,
          donGia: Number(row.donGia),
          hinhAnh: row.hinhAnh,
        });
      }
    });
    return Array.from(ordersMap.values());
  },

  // ---------- LẤY ĐƠN THEO KHÁCH HÀNG ----------
  getOrdersByCustomerId: async (maKhachHang) => {
    const query = `
      SELECT
        dh.maDonHang,
        dh.ngayDatHang AS ngayTao,
        dh.trangThai,
        dh.phuongThucThanhToan AS trangThaiThanhToan,
        dh.tongGiaTri AS tongTien,
        ctdh.soLuong,
        ctdh.donGia,
        sp.maSanPham,
        sp.tenSanPham,
        sp.anhMinhHoaSP AS hinhAnh
      FROM DonHang dh
      JOIN ChiTietDonHang ctdh ON dh.maDonHang = ctdh.maDonHang
      JOIN SanPham sp ON ctdh.maSanPham = sp.maSanPham
      WHERE dh.maKhachHang = ?
      ORDER BY dh.ngayDatHang DESC
    `;
    const [rows] = await db.query(query, [maKhachHang]);
    return OrderModel._groupOrders(rows);
  },

  // ---------- LẤY ĐƠN THEO KHÁCH HÀNG + TRẠNG THÁI ----------
  getOrdersByCustomerIdAndStatus: async (maKhachHang, status) => {
    let dbStatus = [];

    if (status === "cho-giao-hang") {
      dbStatus = ["Chờ xử lý", "Chờ xác nhận", "Đã xác nhận", "Đang giao hàng"];
    } else if (status === "hoan-thanh") {
      dbStatus = ["Đã giao", "Đã giao hàng", "Hoàn thành"];
    } else if (status === "da-huy") {
      dbStatus = ["Đã hủy"];
    } else {
      dbStatus = [status];
    }

    const query = `
      SELECT
        dh.maDonHang,
        dh.ngayDatHang AS ngayTao,
        dh.trangThai,
        dh.phuongThucThanhToan AS trangThaiThanhToan,
        dh.tongGiaTri AS tongTien,
        ctdh.soLuong,
        ctdh.donGia,
        sp.maSanPham,
        sp.tenSanPham,
        sp.anhMinhHoaSP AS hinhAnh
      FROM DonHang dh
      JOIN ChiTietDonHang ctdh ON dh.maDonHang = ctdh.maDonHang
      JOIN SanPham sp ON ctdh.maSanPham = sp.maSanPham
      WHERE dh.maKhachHang = ? AND dh.trangThai IN (?)
      ORDER BY dh.ngayDatHang DESC
    `;
    const [rows] = await db.query(query, [maKhachHang, dbStatus]);
    return OrderModel._groupOrders(rows);
  },

  // ---------- TẠO ĐƠN ----------
  createOrder: async (orderData) => {
    const { fail } = require('../utils/validation');
    if (!orderData.maKhachHang || !Number.isFinite(Number(orderData.tongGiaTri)) || Number(orderData.tongGiaTri) <= 0 || !['Chờ xử lý', 'Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn thành', 'Đã hủy'].includes(orderData.trangThai || 'Chờ xác nhận')) throw fail('Thông tin đơn hàng không hợp lệ.');
    const maDonHang = require('crypto').randomUUID();

    let ngayDatHang = orderData.ngayDatHang || new Date();
    if (typeof ngayDatHang === "string") ngayDatHang = new Date(ngayDatHang);
    if (Number.isNaN(ngayDatHang.getTime())) throw fail("Ngày đặt hàng không hợp lệ.");
    const formattedDate = ngayDatHang.toISOString().split("T")[0];

    const query = `
      INSERT INTO DonHang (
        maDonHang,
        maKhachHang,
        maDiaChi,
        tongGiaTri,
        phuongThucThanhToan,
        trangThai,
        ngayDatHang,
        ghiChu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      maDonHang,
      orderData.maKhachHang,
      orderData.maDiaChi || null,
      orderData.tongGiaTri || 0,
      orderData.phuongThucThanhToan || "Chưa thanh toán",
      orderData.trangThai || "Chờ xác nhận",
      formattedDate,
      orderData.ghiChu || null,
    ]);

    return { insertId: maDonHang, maDonHang };
  },

  // ---------- THÊM CHI TIẾT ĐƠN ----------
  addOrderDetails: async (maDonHang, products) => {
    const [maxResult] = await db.query(
      "SELECT COALESCE(MAX(maChiTiet), 0) as maxId FROM ChiTietDonHang"
    );
    let maChiTiet = maxResult[0].maxId + 1;

    const query = `
      INSERT INTO ChiTietDonHang (
        maChiTiet,
        maDonHang,
        maSanPham,
        soLuong,
        donGia
      ) VALUES (?, ?, ?, ?, ?)
    `;

    for (const product of products) {
      await db.query(query, [
        maChiTiet++,
        maDonHang,
        product.maSanPham,
        product.soLuong,
        product.donGia,
      ]);

      await db.query(
        "UPDATE SanPham SET soLuongTon = soLuongTon - ? WHERE maSanPham = ?",
        [product.soLuong, product.maSanPham]
      );
    }

    return { success: true };
  },

  // ---------- CẬP NHẬT ĐƠN ----------
  updateOrder: async (maDonHang, data) => {
    const { transaction, changeStatus } = require('../services/checkout');
    return transaction(async connection => {
      const [rows] = await connection.query('SELECT * FROM DonHang WHERE maDonHang = ? FOR UPDATE', [maDonHang]);
      if (!rows.length) throw require('../utils/validation').fail('Không tìm thấy đơn hàng.', 404);
      const order = rows[0];
      if (data.maKhachHang && data.maKhachHang !== order.maKhachHang) throw require('../utils/validation').fail('Không được chuyển đơn hàng sang khách hàng khác.');
      if (data.trangThai) await changeStatus(maDonHang, data.trangThai, null, connection);
      if (data.phuongThucThanhToan) {
        if (typeof data.phuongThucThanhToan !== 'string' || !['Ngân hàng', 'Nhận hàng', 'Tại cửa hàng', 'COD', 'Chuyển khoản', 'Chưa thanh toán', 'Chờ xử lý', 'Chờ thanh toán - Ngân hàng', 'Chờ xác nhận - Ngân hàng', 'Đã thanh toán', 'Đã thanh toán - Ngân hàng'].includes(data.phuongThucThanhToan)) throw require('../utils/validation').fail('Trạng thái thanh toán không hợp lệ.');
        if ((data.trangThai || order.trangThai) === 'Đã hủy' && data.phuongThucThanhToan.startsWith('Đã thanh toán')) throw require('../utils/validation').fail('Không thể xác nhận thanh toán cho đơn đã hủy.', 409);
        await connection.query('UPDATE DonHang SET phuongThucThanhToan = ? WHERE maDonHang = ?', [data.phuongThucThanhToan, maDonHang]);
      }
      return { affectedRows: 1 };
    });
  },
  updatePaymentStatus: async (maDonHang, status) => OrderModel.updateOrder(maDonHang, { phuongThucThanhToan: status }),
  updateDeliveryStatus: async (maDonHang, status) => require('../services/checkout').changeStatus(maDonHang, status),
  deleteOrder: async maDonHang => require('../services/checkout').changeStatus(maDonHang, 'Đã hủy'),

  // Thống kê
  getOrderStatistics: async () => {
    const query = `
      SELECT
        trangThai,
        COUNT(*) as soLuong,
        SUM(tongGiaTri) as tongDoanhThu
      FROM DonHang
      GROUP BY trangThai
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  // Lấy thông tin cơ bản
  getOrderBasicInfo: async (maDonHang) => {
    const query = `
      SELECT
        dh.maDonHang,
        dh.ngayDatHang AS ngayTao,
        kh.hoTen AS tenKhachHang,
        kh.soDienThoai AS soDienThoai,
        di.hoTenNguoiNhan AS tenNguoiNhan,
        di.soDienThoaiNguoiNhan AS sdtNguoiNhan,
        di.diaChiNhanHang AS diaChiNguoiNhan,
        dh.trangThai,
        dh.phuongThucThanhToan AS trangThaiThanhToan,
        NULL AS trangThaiGiaoHang,
        dh.tongGiaTri AS tongTien
      FROM DonHang dh
      LEFT JOIN KhachHang kh ON dh.maKhachHang = kh.maKhachHang
      LEFT JOIN DiaChi di ON dh.maDiaChi = di.maDiaChi
      WHERE dh.maDonHang = ?
    `;
    const [rows] = await db.query(query, [maDonHang]);
    return rows[0] || null;
  },
};

module.exports = OrderModel;
