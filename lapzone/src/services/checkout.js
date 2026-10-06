const db = require('../config/db');
const { randomUUID } = require('crypto');
const { quantity, text, fail } = require('../utils/validation');

async function transaction(work, allocateIds = false) {
  const connection = await db.getConnection();
  const lock = `${process.env.DB_NAME || 'lapzone'}:order-details`;
  let locked = false;
  try {
    if (allocateIds) {
      const [rows] = await connection.query('SELECT GET_LOCK(?, 10) AS acquired', [lock]);
      if (rows[0].acquired !== 1) throw fail('Hệ thống đang bận. Vui lòng thử lại.', 409);
      locked = true;
    }
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    try { if (locked) await connection.query('SELECT RELEASE_LOCK(?)', [lock]); }
    finally { connection.release(); }
  }
}

async function placeOrder(userId, data, fromCart = false) {
  const methods = ['Ngân hàng', 'Nhận hàng', 'Tại cửa hàng'];
  if (!text(data.hoTenNguoiNhan) || !text(data.diaChiNhanHang) ||
      !/^0\d{9}$/.test(data.soDienThoaiNguoiNhan || '') ||
      !methods.includes(data.phuongThuc) || (data.ghiChu && !text(data.ghiChu))) {
    throw fail('Kiểm tra họ tên, số điện thoại 10 số, địa chỉ và phương thức thanh toán.');
  }
  const items = fromCart ? data.cartItems : [{ maSanPham: data.maSanPham, soLuong: data.soLuong }];
  if (!Array.isArray(items) || !items.length || items.length > 100 ||
      items.some(item => !item || !text(item.maSanPham) || !quantity(item.soLuong)) ||
      new Set(items.map(item => item.maSanPham)).size !== items.length) {
    throw fail('Danh sách sản phẩm hoặc số lượng không hợp lệ.');
  }
  return transaction(async connection => {
    const [customers] = await connection.query('SELECT maKhachHang, trangThai FROM KhachHang WHERE maKhachHang = ? FOR UPDATE', [userId]);
    if (!customers.length) throw fail('Tài khoản không tồn tại.', 401);
    if (customers[0].trangThai !== 'Hoạt động') throw fail('Tài khoản đã bị khóa.', 403);
    let cartId;
    if (fromCart) {
      const [carts] = await connection.query('SELECT maGioHang FROM GioHang WHERE maKhachHang = ? FOR UPDATE', [userId]);
      if (!carts.length) throw fail('Giỏ hàng trống.');
      cartId = carts[0].maGioHang;
    }
    let total = 0;
    const products = [];
    // Khóa cùng thứ tự để tránh deadlock khi nhiều đơn có chung sản phẩm.
    for (const item of [...items].sort((a, b) => a.maSanPham.localeCompare(b.maSanPham))) {
      const amount = quantity(item.soLuong);
      const [rows] = await connection.query('SELECT * FROM SanPham WHERE maSanPham = ? FOR UPDATE', [item.maSanPham]);
      if (!rows.length) throw fail('Không tìm thấy sản phẩm.', 404);
      const product = rows[0];
      if (product.soLuongTon < amount || product.tinhTrang === 'Ngừng kinh doanh') {
        throw fail(`Sản phẩm ${product.tenSanPham} không đủ tồn kho.`, 409);
      }
      if (fromCart) {
        const [cartItems] = await connection.query('SELECT soLuong FROM ChiTietGioHang WHERE GioHangmaGioHang = ? AND SanPhammaSanPham = ? FOR UPDATE', [cartId, item.maSanPham]);
        if (!cartItems.length || cartItems[0].soLuong !== amount) throw fail('Giỏ hàng đã thay đổi. Vui lòng chọn lại sản phẩm.', 409);
      }
      const price = Number(product.giaBan);
      if (!Number.isFinite(price) || price <= 0) throw fail('Giá sản phẩm không hợp lệ.', 409);
      total += price * amount;
      products.push({ id: item.maSanPham, amount, price });
    }
    let recipient = { name: data.hoTenNguoiNhan.trim(), phone: data.soDienThoaiNguoiNhan, address: data.diaChiNhanHang.trim() };
    if (data.maDiaChiChon) {
      const [addresses] = await connection.query('SELECT * FROM DiaChi WHERE maDiaChi = ? AND maKhachHang = ?', [data.maDiaChiChon, userId]);
      if (!addresses.length) throw fail('Địa chỉ không thuộc tài khoản của bạn.', 403);
      recipient = { name: addresses[0].hoTenNguoiNhan, phone: addresses[0].soDienThoaiNguoiNhan, address: addresses[0].diaChiNhanHang };
    }
    // Lưu bản sao người nhận để cập nhật hồ sơ không đổi lịch sử giao hàng.
    const addressId = randomUUID();
    await connection.query('INSERT INTO DiaChi (maDiaChi, hoTenNguoiNhan, soDienThoaiNguoiNhan, diaChiNhanHang, laMacDinh, maKhachHang) VALUES (?, ?, ?, ?, 0, ?)', [addressId, recipient.name, recipient.phone, recipient.address, userId]);
    const orderId = randomUUID();
    const payment = data.phuongThuc === 'Ngân hàng' ? 'Chờ thanh toán - Ngân hàng' : data.phuongThuc;
    await connection.query("INSERT INTO DonHang (maDonHang, ngayDatHang, tongGiaTri, trangThai, phuongThucThanhToan, ghiChu, maKhachHang, maDiaChi) VALUES (?, CURDATE(), ?, 'Chờ xác nhận', ?, ?, ?, ?)", [orderId, total, payment, data.ghiChu?.trim() || null, userId, addressId]);
    const [last] = await connection.query('SELECT COALESCE(MAX(maChiTiet), 0) AS lastId FROM ChiTietDonHang');
    let detailId = last[0].lastId;
    for (const product of products) {
      await connection.query('INSERT INTO ChiTietDonHang (maChiTiet, maDonHang, maSanPham, soLuong, donGia) VALUES (?, ?, ?, ?, ?)', [++detailId, orderId, product.id, product.amount, product.price]);
      await connection.query('UPDATE SanPham SET soLuongTon = soLuongTon - ? WHERE maSanPham = ?', [product.amount, product.id]);
      if (fromCart) await connection.query('DELETE FROM ChiTietGioHang WHERE GioHangmaGioHang = ? AND SanPhammaSanPham = ?', [cartId, product.id]);
    }
    return { maDonHang: orderId, tongGiaTri: total, phuongThucThanhToan: data.phuongThuc };
  }, true);
}

const stages = {
  'Chờ xử lý': 0, 'Chờ xác nhận': 0, 'Đã xác nhận': 1,
  'Đang giao hàng': 2, 'Đã giao': 3, 'Đã giao hàng': 3, 'Hoàn thành': 3, 'Đã hủy': 4,
};
async function changeStatus(orderId, target, customerId, executor) {
  if (typeof target !== 'string' || !Object.hasOwn(stages, target)) throw fail('Trạng thái đơn hàng không hợp lệ.');
  const work = async connection => {
    const [rows] = await connection.query('SELECT * FROM DonHang WHERE maDonHang = ? FOR UPDATE', [orderId]);
    if (!rows.length) throw fail('Không tìm thấy đơn hàng.', 404);
    const order = rows[0];
    if (customerId && order.maKhachHang !== customerId) throw fail('Bạn không có quyền hủy đơn hàng này.', 403);
    if (order.trangThai === target) return { affectedRows: 1 };
    const current = stages[order.trangThai];
    if (current === 4 || current === 3 || (target === 'Đã hủy' && current > 1) ||
        (customerId && target !== 'Đã hủy') || (target !== 'Đã hủy' && stages[target] < current)) {
      throw fail('Không thể chuyển trạng thái đơn hàng này.', 409);
    }
    if (target === 'Đã hủy') {
      const [details] = await connection.query('SELECT maSanPham, soLuong FROM ChiTietDonHang WHERE maDonHang = ? ORDER BY maSanPham', [orderId]);
      for (const detail of details) await connection.query('UPDATE SanPham SET soLuongTon = soLuongTon + ? WHERE maSanPham = ?', [detail.soLuong, detail.maSanPham]);
    }
    const [result] = await connection.query('UPDATE DonHang SET trangThai = ? WHERE maDonHang = ?', [target, orderId]);
    return result;
  };
  return executor ? work(executor) : transaction(work);
}
module.exports = { placeOrder, changeStatus, transaction };
