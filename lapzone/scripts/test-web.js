// Database dùng một lần, tách biệt hoàn toàn với dữ liệu lapzone của người dùng.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const database = `lapzone_test_${Date.now()}_${process.pid}`;
const print = console.log;
console.log = () => {};
const results = [];
let connection, server, pool, base;
async function check(name, work) {
  try { await work(); results.push({ name, passed: true }); print('PASS ' + name); }
  catch (error) { results.push({ name, passed: false, error: error.message }); print('FAIL ' + name + ': ' + error.message); }
}
async function request(url, cookie, body, method = 'GET') {
  const response = await fetch(base + url, { method, redirect: 'manual', signal: AbortSignal.timeout(8000),
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  let data; try { data = JSON.parse(text); } catch {}
  return { status: response.status, text, data, cookie: response.headers.get('set-cookie')?.split(';')[0], location: response.headers.get('location') };
}
async function login(name, role = 'kh', password = '123456') {
  const response = await request('/login', null, { tendangnhap: name, matkhau: password, vt: role }, 'POST');
  assert.equal(response.status, 302); assert.ok(response.cookie); return response.cookie;
}
async function scalar(sql, params = []) { const [rows] = await connection.query(sql, params); return Object.values(rows[0])[0]; }
async function main() {
  connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD, charset: 'utf8mb4' });
  await connection.query('CREATE DATABASE ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', [database]);
  await connection.query('USE ??', [database]);
  for (const filename of ['db_init.sql', 'init_data.sql']) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'db', filename), 'utf8')
      .replace(/^\s*--.*$/gm, '').replace(/CREATE DATABASE[^;]+;/i, '').replace(/USE lapzone;/g, '');
    for (const statement of source.split(';').map(x => x.trim()).filter(Boolean)) await connection.query(statement);
  }
  process.env.DB_NAME = database;
  const app = require('../src/server'); pool = require('../src/config/db');
  server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  for (const url of ['/', '/login', '/register', '/product/SPG01', '/product/category/DM01', '/product/review-product/SPG01', '/search/resultSearch?keyword=Asus', '/review/list/SPG01', '/review/stats/SPG01']) {
    await check('Trang công khai ' + url, async () => assert.equal((await request(url)).status, 200));
  }
  await check('Sản phẩm không tồn tại trả 404', async () => assert.equal((await request('/product/UNKNOWN')).status, 404));
  await check('Chưa đăng nhập không truy cập giỏ', async () => assert.equal((await request('/cart')).location, '/login'));
  const user = await login('user1'), user2 = await login('user2'), admin = await login('admin', 'qtv');
  await check('Mật khẩu cũ được băm sau đăng nhập', async () => assert.match(await scalar("SELECT matKhau FROM KhachHang WHERE maKhachHang='KH001'"), /^scrypt\$/));
  await check('Đăng nhập với mật khẩu đã băm', async () => assert.ok(await login('user1')));
  for (const url of ['/kh/trangchu', '/cart', '/profile', '/kh/doimatkhau', '/order/checkout', '/order/dat-hang/SPG01', '/order/my-orders', '/order/my-orders/DH001']) {
    await check('Trang khách hàng ' + url, async () => assert.equal((await request(url, user)).status, 200));
  }
  for (const url of ['/qtv/trangchu', '/quanlysanpham', '/quanlysanpham/create', '/quanlysanpham/edit/SPG01', '/quanlysanpham/report', '/quanlykho', '/quanlykho/statistics', '/quanlytaikhoan', '/quanlydonhang', '/quanlydonhang/tao', '/quanlydonhang/chitiet/DH001', '/quanlydonhang/sua/DH001', '/xembaocao']) {
    await check('Trang quản trị ' + url, async () => assert.equal((await request(url, admin)).status, 200));
  }
  for (const url of ['/qtv/trangchu', '/quanlytaikhoan', '/quanlysanpham', '/quanlydonhang', '/quanlykho']) {
    await check('Chặn khách hàng tại ' + url, async () => assert.equal((await request(url, user)).status, 403));
  }
  await check('Chặn API tạo khách hàng với vai trò khách', async () => assert.equal((await request('/quanlydonhang/api/checkOrCreateCustomer', user, { tenKhachHang: 'Test' }, 'POST')).status, 403));
  await check('Chặn xem đơn người khác', async () => assert.equal((await request('/order/my-orders/DH002', user)).status, 403));
  await check('Bộ lọc hãng và giá kết hợp đúng', async () => {
    const rows = await require('../src/models/SPModel').searchWithFilters({ keyword: '', brand: 'asus', maxPrice: 30000000 });
    assert.ok(rows.length); assert.ok(rows.every(row => row.thuongHieu === 'Asus' && Number(row.giaBan) <= 30000000));
  });
  await check('Bộ lọc AI tìm đúng danh mục', async () => {
    const rows = await require('../src/models/SPModel').searchWithFilters({ category: 'ai' });
    assert.equal(rows.length, 10);
  });
  for (const amount of ['abc', '-1', '1.5', '1abc', 0, 100001]) {
    await check('Giỏ từ chối số lượng ' + amount, async () => assert.equal((await request('/cart/add', user, { maSanPham: 'SPG01', soLuong: amount }, 'POST')).status, 400));
  }
  await check('Giỏ từ chối cộng dồn vượt kho', async () => assert.equal((await request('/cart/add', user, { maSanPham: 'SPG01', soLuong: 20 }, 'POST')).status, 409));
  await check('Giỏ từ chối cập nhật vượt kho', async () => assert.equal((await request('/cart/update', user, { maSanPham: 'SPG01', newQuantity: 999 }, 'POST')).status, 409));
  const shipping = { hoTenNguoiNhan: 'Khách Test', soDienThoaiNguoiNhan: '0901234567', diaChiNhanHang: 'Địa chỉ kiểm thử', phuongThuc: 'Nhận hàng', ghiChu: '<script>alert(1)</script>' };
  const orderBody = { ...shipping, maSanPham: 'SPG01', soLuong: 1, tongGiaTri: 1 };
  let orderId;
  const stockBefore = Number(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'"));
  await check('Đặt hàng tính giá từ database', async () => {
    const response = await request('/order/dat-hang', user, orderBody, 'POST');
    assert.equal(response.status, 200); orderId = response.data.order.maDonHang;
    assert.equal(response.data.order.tongGiaTri, 15990000);
    assert.equal(Number(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'")), stockBefore - 1);
  });
  await check('Ghi chú đơn hàng được escape', async () => {
    const response = await request('/order/my-orders/' + orderId, user);
    assert.equal(response.status, 200); assert.ok(!response.text.includes('<script>alert(1)</script>')); assert.ok(response.text.includes('&lt;script&gt;'));
  });
  await check('Hủy đơn hoàn kho', async () => {
    assert.equal((await request('/order/cancel/' + orderId, user, {}, 'POST')).status, 200);
    assert.equal(Number(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'")), stockBefore);
  });
  await check('Hủy lặp không hoàn kho lần hai', async () => {
    assert.equal((await request('/order/cancel/' + orderId, user, {}, 'POST')).status, 200);
    assert.equal(Number(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'")), stockBefore);
  });
  await check('Địa chỉ người khác bị từ chối', async () => assert.equal((await request('/order/dat-hang', user, { ...orderBody, maDiaChiChon: 'DC02' }, 'POST')).status, 403));
  await check('Đơn vượt kho không tạo bản ghi dở dang', async () => {
    const before = await scalar('SELECT COUNT(*) FROM DonHang');
    assert.equal((await request('/order/dat-hang', user, { ...orderBody, soLuong: 999 }, 'POST')).status, 409);
    assert.equal(await scalar('SELECT COUNT(*) FROM DonHang'), before);
  });
  await check('Checkout từ chối sản phẩm ngoài giỏ', async () => assert.equal((await request('/order/checkout', user, { ...shipping, cartItems: [{ maSanPham: 'SPA01', soLuong: 1 }] }, 'POST')).status, 409));
  await check('Checkout hợp lệ tính lại giá và xóa đúng sản phẩm', async () => {
    const response = await request('/order/checkout', user, { ...shipping, cartItems: [{ maSanPham: 'SPG01', soLuong: 1, DonGia: 1 }], tongGiaTri: 1 }, 'POST');
    assert.equal(response.status, 200); assert.equal(response.data.order.tongGiaTri, 15990000);
    assert.equal(await scalar("SELECT COUNT(*) FROM ChiTietGioHang WHERE GioHangmaGioHang='GH001' AND SanPhammaSanPham='SPG01'"), 0);
    assert.equal(await scalar("SELECT COUNT(*) FROM ChiTietGioHang WHERE GioHangmaGioHang='GH001' AND SanPhammaSanPham='SPV01'"), 1);
  });
  await check('Hai người mua sản phẩm cuối: chỉ một đơn thành công', async () => {
    await connection.query("UPDATE SanPham SET soLuongTon=1 WHERE maSanPham='SPA10'");
    const responses = await Promise.all([user, user2].map(cookie => request('/order/dat-hang', cookie, { ...orderBody, maSanPham: 'SPA10' }, 'POST')));
    assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
    assert.equal(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPA10'"), 0);
  });
  await check('Đăng ký từ chối dữ liệu sai', async () => assert.equal((await request('/register', null, { hoTen: 'Test', tenDangNhap: 'a', email: 'wrong', matKhau: '123', soDienThoai: '12' }, 'POST')).status, 400));
  await check('Đăng ký tài khoản mới lưu mật khẩu băm', async () => {
    const response = await request('/register', null, { hoTen: 'Khách Kiểm Thử', tenDangNhap: 'testuser99', email: 'testuser99@example.test', matKhau: 'TestPass!99', matKhau2: 'TestPass!99', soDienThoai: '0909999999' }, 'POST');
    assert.equal(response.status, 302); assert.ok(await login('testuser99', 'kh', 'TestPass!99'));
    assert.match(await scalar("SELECT matKhau FROM KhachHang WHERE tenDangNhap='testuser99'"), /^scrypt\$/);
  });
  const productData = { maSanPham: 'TEST_PRODUCT', tenSanPham: "Laptop thử O'Brien", thuonghieu: 'Asus', tinhTrang: 'Mới', soLuongTon: 3, giaBan: 10000000, giaNhap: 8000000, maDanhMuc: 'DM01', anhMinhHoaSP: '/images/asus_tuf_gaming_f16_fx607vj.png' };
  await check('Admin thêm sản phẩm có thông số tùy chọn', async () => {
    assert.equal((await request('/quanlysanpham/create', admin, productData, 'POST')).status, 302);
    assert.equal((await request('/product/TEST_PRODUCT')).status, 200);
    assert.equal(Number(await scalar("SELECT giaNhap FROM SanPham WHERE maSanPham='TEST_PRODUCT'")), 8000000);
  });
  await check('Admin sửa sản phẩm giữ mã và giá nhập', async () => {
    assert.equal((await request('/quanlysanpham/edit/TEST_PRODUCT', admin, { ...productData, giaBan: 12000000 }, 'POST')).status, 302);
    assert.equal(Number(await scalar("SELECT giaBan FROM SanPham WHERE maSanPham='TEST_PRODUCT'")), 12000000);
  });
  await check('Admin từ chối giá và tồn kho âm', async () => assert.equal((await request('/quanlysanpham/create', admin, { ...productData, maSanPham: 'INVALID', giaBan: -1, soLuongTon: -1 }, 'POST')).status, 400));
  await check('Không xóa sản phẩm đã có đơn hàng', async () => assert.equal((await request('/quanlysanpham/SPG01', admin, {}, 'DELETE')).status, 409));
  await check('Xóa sản phẩm chưa phát sinh đơn', async () => {
    assert.equal((await request('/quanlysanpham/TEST_PRODUCT', admin, {}, 'DELETE')).status, 200);
    assert.equal((await request('/product/TEST_PRODUCT')).status, 404);
  });
  await check('Kho từ chối số lượng thập phân', async () => assert.equal((await request('/quanlykho/import', admin, { maSP: 'SPG01', soLuong: 1.5 }, 'POST')).status, 400));
  await check('Kho nhập và xuất đúng số lượng', async () => {
    const before = await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'");
    assert.equal((await request('/quanlykho/import', admin, { maSP: 'SPG01', soLuong: 2 }, 'POST')).status, 200);
    assert.equal((await request('/quanlykho/export', admin, { maSP: 'SPG01', soLuong: 2 }, 'POST')).status, 200);
    assert.equal(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'"), before);
  });
  await check('Kho từ chối xuất vượt tồn', async () => assert.equal((await request('/quanlykho/export', admin, { maSP: 'SPG01', soLuong: 999 }, 'POST')).status, 400));
  let bankId;
  await check('Đặt đơn chuyển khoản và mở trang thanh toán', async () => {
    const response = await request('/order/dat-hang', user, { ...orderBody, phuongThuc: 'Ngân hàng' }, 'POST');
    assert.equal(response.status, 200); bankId = response.data.order.maDonHang;
    assert.equal((await request(response.data.qrPaymentUrl, user)).status, 200);
  });
  await check('Khách gửi yêu cầu không tự xác nhận đã trả tiền', async () => {
    assert.equal((await request('/payment/verify-payment', user, { maDonHang: bankId }, 'POST')).status, 200);
    assert.equal(await scalar('SELECT phuongThucThanhToan FROM DonHang WHERE maDonHang=?', [bankId]), 'Chờ xác nhận - Ngân hàng');
  });
  await check('Chặn xác nhận thanh toán đơn của người khác', async () => assert.equal((await request('/payment/verify-payment', user2, { maDonHang: bankId }, 'POST')).status, 404));
  await check('Admin xác nhận thanh toán', async () => {
    assert.equal((await request('/quanlydonhang/api/orders/' + bankId + '/payment', admin, { trangThaiThanhToan: 'Đã thanh toán' }, 'PATCH')).status, 200);
    assert.equal(await scalar('SELECT phuongThucThanhToan FROM DonHang WHERE maDonHang=?', [bankId]), 'Đã thanh toán');
  });
  await check('Admin hủy đơn hoàn tồn kho', async () => {
    const before = await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'");
    assert.equal((await request('/quanlydonhang/api/orders/' + bankId, admin, {}, 'DELETE')).status, 200);
    assert.equal(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'"), before + 1);
  });
  await check('Không khôi phục đơn đã hủy bằng sửa trạng thái', async () => assert.equal((await request('/quanlydonhang/api/orders/' + bankId + '/status', admin, { trangThai: 'Đã xác nhận' }, 'PATCH')).status, 409));
  await check('Không thanh toán đơn đã hủy', async () => assert.equal((await request('/payment/verify-payment', user, { maDonHang: bankId }, 'POST')).status, 409));
  await check('Không xóa khách hàng làm mất lịch sử đơn', async () => assert.equal((await request('/quanlytaikhoan/xoa/KH001', admin, {}, 'POST')).status, 409));
  await check('Đánh giá đơn hoàn thành: chống gửi trùng đồng thời', async () => {
    const responses = await Promise.all([1, 2].map(() => request('/review/add', user, { productId: 'SPG02', star: 5, content: 'Sản phẩm kiểm thử' }, 'POST')));
    assert.equal(responses.filter(r => r.data?.success).length, 1);
    assert.equal(await scalar('SELECT COUNT(*) FROM DanhGia WHERE maChiTiet=2'), 1);
  });
  await check('Đánh giá từ chối số sao không nguyên', async () => assert.equal((await request('/review/add', user, { productId: 'SPG02', star: 4.5, content: 'Test' }, 'POST')).data.success, false));
  await check('Hồ sơ không dùng trùng email người khác', async () => assert.equal((await request('/profile/update', user, { hoTen: 'Khách Test', email: 'user2@gmail.com', soDienThoai: '0911000001', diaChiNhanHang: 'Địa chỉ mới' }, 'POST')).status, 409));
  await check('Đổi mật khẩu xác minh mật khẩu cũ', async () => {
    const response = await request('/kh/doimatkhau', user, { currentPassword: 'wrong', newPassword: 'NewPass!99', confirmPassword: 'NewPass!99' }, 'POST');
    assert.ok(response.text.includes('Mật khẩu hiện tại không đúng'));
  });
  await check('Đổi mật khẩu hợp lệ và đăng nhập lại', async () => {
    assert.equal((await request('/kh/doimatkhau', user, { currentPassword: '123456', newPassword: 'NewPass!99', confirmPassword: 'NewPass!99' }, 'POST')).status, 200);
    assert.ok(await login('user1', 'kh', 'NewPass!99'));
    assert.equal((await request('/login', null, { tendangnhap: 'user1', vt: 'kh', matkhau: '123456' }, 'POST')).status, 401);
  });
  await check('Khóa tài khoản chặn phiên đã đăng nhập', async () => {
    assert.equal((await request('/quanlytaikhoan/trangthai/KH002', admin, {}, 'POST')).status, 302);
    assert.equal((await request('/cart', user2)).status, 403);
  });
  await check('Gửi POST từ origin khác bị chặn', async () => {
    const response = await fetch(base + '/cart/add', { method: 'POST', headers: { Origin: 'https://example.test', Cookie: user, 'Content-Type': 'application/json' }, body: JSON.stringify({ maSanPham: 'SPG01', soLuong: 1 }) });
    assert.equal(response.status, 403);
  });
  await check('GET không thay đổi giỏ hàng', async () => assert.equal((await request('/cart/add?maSanPham=SPG01&soLuong=1', user)).status, 405));
  await check('Form đặt hàng không lộ mật khẩu trong HTML', async () => assert.ok(!(await request('/order/dat-hang/SPG01', user)).text.includes('scrypt$')));
  await check('Hồ sơ thiếu tên hoặc địa chỉ trả lỗi 400', async () => assert.equal((await request('/profile/update', user, { email: 'test@example.com' }, 'POST')).status, 400));
  let adminOrderId;
  await check('Admin tạo đơn có chi tiết, giá thực và trừ tồn', async () => {
    const before = await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'");
    const response = await request('/quanlydonhang/api/orders', admin, { ...orderBody, maKhachHang: 'KH001', tongGiaTri: 1 }, 'POST');
    assert.equal(response.status, 200); adminOrderId = response.data.maDonHang;
    assert.equal(await scalar('SELECT COUNT(*) FROM ChiTietDonHang WHERE maDonHang=?', [adminOrderId]), 1);
    assert.equal(Number(await scalar('SELECT tongGiaTri FROM DonHang WHERE maDonHang=?', [adminOrderId])), 15990000);
    assert.equal(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG01'"), before - 1);
  });
  await check('Admin không tạo đơn rỗng chỉ bằng tổng tiền', async () => assert.equal((await request('/quanlydonhang/api/orders', admin, { maKhachHang: 'KH001', tongGiaTri: 1000 }, 'POST')).status, 400));
  await check('Admin không tạo đơn cho khách bị khóa', async () => assert.equal((await request('/quanlydonhang/api/orders', admin, { ...orderBody, maKhachHang: 'KH002' }, 'POST')).status, 403));
  await check('Bộ lọc chờ xử lý gồm đơn chờ xác nhận', async () => {
    const response = await request('/quanlydonhang/api/orders?status=' + encodeURIComponent('Chờ xử lý'), admin);
    assert.equal(response.status, 200); assert.ok(response.data.data.some(order => order.maDonHang === adminOrderId));
    assert.ok(response.data.data.every(order => ['Chờ xử lý', 'Chờ xác nhận'].includes(order.trangThai)));
  });
  await check('Bộ lọc chưa thanh toán gồm COD, loại đơn hủy', async () => {
    const response = await request('/quanlydonhang/api/orders?paymentStatus=' + encodeURIComponent('Chờ xử lý'), admin);
    assert.equal(response.status, 200); assert.ok(response.data.data.some(order => order.maDonHang === adminOrderId));
    assert.ok(response.data.data.every(order => !order.trangThaiThanhToan.startsWith('Đã thanh toán') && order.trangThai !== 'Đã hủy'));
  });
  await check('Bộ lọc đã thanh toán nhận cả hậu tố ngân hàng', async () => {
    await connection.query("UPDATE DonHang SET phuongThucThanhToan = 'Đã thanh toán - Ngân hàng' WHERE maDonHang=?", [adminOrderId]);
    const response = await request('/quanlydonhang/api/orders?paymentStatus=' + encodeURIComponent('Đã thanh toán'), admin);
    assert.ok(response.data.data.some(order => order.maDonHang === adminOrderId));
  });
  await check('HTML sửa sản phẩm giữ tình trạng Còn hàng', async () => assert.ok((await request('/quanlysanpham/edit/SPG01', admin)).text.includes('value="Còn hàng" selected')));
  await check('Chi tiết admin hiển thị tổng từ đơn hàng', async () => assert.ok((await request('/quanlydonhang/chitiet/' + adminOrderId, admin)).text.includes('15.990.000')));
  await check('Trang không tồn tại trả 404 cho khách chưa đăng nhập', async () => assert.equal((await request('/unknown-page')).status, 404));
  await check('Trang không tồn tại trả 404 cho khách đã đăng nhập', async () => assert.equal((await request('/unknown-page', user)).status, 404));
  await check('Không nhận trạng thái từ prototype', async () => assert.equal((await request('/quanlydonhang/api/orders/' + adminOrderId + '/status', admin, { trangThai: 'toString' }, 'PATCH')).status, 400));
  await check('Từ chối trạng thái thanh toán tùy ý', async () => assert.equal((await request('/quanlydonhang/api/orders/' + adminOrderId + '/payment', admin, { trangThaiThanhToan: '<script>alert(1)</script>' }, 'PATCH')).status, 400));
  await check('Import file kho cập nhật nhiều dòng', async () => {
    const response = await request('/quanlykho/import-file', admin, { items: [{ maSP: 'SPG03', soLuongTon: 12 }, { maSP: 'SPG04', soLuongTon: 0 }] }, 'POST');
    assert.equal(response.status, 200);
    assert.equal(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG03'"), 12);
    assert.equal(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG04'"), 0);
  });
  await check('Import có mã sai rollback toàn bộ file', async () => {
    assert.equal((await request('/quanlykho/import-file', admin, { items: [{ maSP: 'SPG03', soLuongTon: 99 }, { maSP: 'ZZ_MISSING', soLuongTon: 5 }] }, 'POST')).status, 404);
    assert.equal(await scalar("SELECT soLuongTon FROM SanPham WHERE maSanPham='SPG03'"), 12);
  });
  await check('Import file từ chối tồn âm hoặc thiếu', async () => assert.equal((await request('/quanlykho/import-file', admin, { items: [{ maSP: 'SPG03', soLuongTon: -1 }] }, 'POST')).status, 400));
  await check('Import file từ chối sản phẩm lặp', async () => assert.equal((await request('/quanlykho/import-file', admin, { items: [{ maSP: 'SPG03', soLuongTon: 5 }, { maSP: 'SPG03', soLuongTon: 8 }] }, 'POST')).status, 400));
  await check('Khách hàng không được import kho', async () => assert.equal((await request('/quanlykho/import-file', user, { items: [{ maSP: 'SPG03', soLuongTon: 10 }] }, 'POST')).status, 403));
  await check('Báo cáo doanh thu chỉ tính đơn hoàn thành', async () => {
    const report = await require('../src/models/reportModel').getReportStats();
    const expected = await scalar("SELECT SUM(tongGiaTri) FROM DonHang WHERE trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng')");
    assert.equal(Number(report.orderSummary.totalRevenue), Number(expected));
  });
  await check('Kho tính đã bán chỉ từ đơn hoàn thành', async () => {
    const product = await require('../src/models/khoModel').getProductById('SPG01');
    const expected = await scalar("SELECT COALESCE(SUM(ct.soLuong),0) FROM ChiTietDonHang ct JOIN DonHang dh ON dh.maDonHang=ct.maDonHang WHERE ct.maSanPham='SPG01' AND dh.trangThai IN ('Hoàn thành','Đã giao','Đã giao hàng')");
    assert.equal(Number(product.daBan), Number(expected));
  });
  await check('Cập nhật hồ sơ không sửa địa chỉ của đơn mới', async () => {
    const response = await request('/order/dat-hang', user, { ...orderBody, maDiaChiChon: 'DC01' }, 'POST');
    assert.equal(response.status, 200);
    const orderId = response.data.order.maDonHang;
    assert.notEqual(await scalar('SELECT maDiaChi FROM DonHang WHERE maDonHang=?', [orderId]), 'DC01');
    assert.equal((await request('/profile/update', user, { hoTen: 'Khách Hàng', soDienThoai: '0911998888', email: 'profile@example.com', diaChiNhanHang: 'Địa chỉ mới' }, 'POST')).status, 302);
    assert.equal(await scalar('SELECT dc.diaChiNhanHang FROM DiaChi dc JOIN DonHang dh ON dh.maDiaChi=dc.maDiaChi WHERE dh.maDonHang=?', [orderId]), 'Hà Nội');
    assert.equal(await scalar("SELECT hoTenNguoiNhan FROM DiaChi WHERE maDiaChi='DC01'"), 'Khách Hàng');
  });
}
main().catch(error => { results.push({ name: 'Thiết lập kiểm thử', passed: false, error: error.message }); print(error.message); })
  .finally(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    if (pool) await pool.end();
    if (connection) {
      if (/^lapzone_test_\d+_\d+$/.test(database)) await connection.query('DROP DATABASE IF EXISTS ??', [database]);
      await connection.end();
    }
    fs.mkdirSync(path.join(__dirname, '..', 'artifacts'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '..', 'artifacts', 'test-results.json'), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
    print(`${results.filter(r => r.passed).length}/${results.length} checks passed`);
    if (results.some(r => !r.passed)) process.exitCode = 1;
  });

