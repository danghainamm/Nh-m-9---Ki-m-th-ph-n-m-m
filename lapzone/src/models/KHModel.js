const db = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');

async function findByUsername(username) {
  const [rows] = await db.query(
    'SELECT * FROM khachhang WHERE tenDangNhap = ?',
    [username]
  );

  //


  return rows[0] || null;
}



//  Tìm theo email
async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM khachhang WHERE email = ?', [email]);
  return rows[0] || null;
}

//  Tìm theo số điện thoại
async function findByPhone(phone) {
  const [rows] = await db.query('SELECT * FROM khachhang WHERE soDienThoai = ?', [phone]);
  return rows[0] || null;
}

//  Tạo tài khoản mới
async function createUser({ maKhachHang, hoTen, tenDangNhap, matKhau, email, soDienThoai, trangThai }) {
  await db.query(
    `INSERT INTO khachhang (maKhachHang, hoTen, tenDangNhap, matKhau, email, soDienThoai, trangThai)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [maKhachHang, hoTen, tenDangNhap, await hashPassword(matKhau), email, soDienThoai, trangThai || 'Hoạt động']
  );
  return true;
}


// Kiểm tra mật khẩu hiện tại
async function checkPassword(userId, password) {
  const [rows] = await db.query(
    'SELECT matKhau FROM khachhang WHERE maKhachHang = ?',
    [userId]
  );

  if (!rows[0]) return false;

  // Loại bỏ khoảng trắng thừa 2 đầu
  return verifyPassword(password, rows[0].matKhau);
}


// Cập nhật mật khẩu mới
async function updatePassword(userId, newPassword) {
  const [result] = await db.query(
    'UPDATE khachhang SET matKhau = ? WHERE maKhachHang = ?',
    [await hashPassword(newPassword), userId]
  );
  return result.affectedRows > 0;
}


async function getCustomerById(id) {
    try {
        const sql = 'SELECT * FROM KhachHang WHERE maKhachHang = ?';
        const [rows] = await db.query(sql, [id]);
        return rows[0] || null;
    } catch (error) {
        throw error;
    }
}

//cập nhật trạng thái
async function updateStatus(id, status) {
    try {
        // status ví dụ: 'Hoạt động' hoặc 'Đã khóa'
        const sql = 'UPDATE KhachHang SET trangThai = ? WHERE maKhachHang = ?';
        const [result] = await db.query(sql, [status, id]);
        return result;
    } catch (error) {
        throw error;
    }
}

//xóa kh
async function deleteCustomer(id) {
  return require('../services/checkout').transaction(async connection => {
    await connection.query('SELECT maKhachHang FROM KhachHang WHERE maKhachHang = ? FOR UPDATE', [id]);
    const [orders] = await connection.query('SELECT maDonHang FROM DonHang WHERE maKhachHang = ? LIMIT 1', [id]);
    if (orders.length) throw require('../utils/validation').fail('Tài khoản đã có đơn hàng. Hãy khóa tài khoản để bảo toàn lịch sử.', 409);
    const [result] = await connection.query('DELETE FROM KhachHang WHERE maKhachHang = ?', [id]);
    return result;
  });
}

//lấy ds kh theo đã lọc
async function getCustomersFiltered({ search, status, limit, offset }) {
    let params = [];
    let whereClause = ' WHERE 1=1';

    // tìm kiếm
    if (search && search.trim() !== '') {
        whereClause += ` AND (hoTen LIKE ? OR SUBSTRING_INDEX(email, '@', 1) LIKE ? OR soDienThoai LIKE ? OR tenDangNhap LIKE ?)`;
        const searchVal = `%${search.trim()}%`;
        params.push(searchVal, searchVal, searchVal, searchVal);
    }

    // lọc trạng thái
    if (status && status !== 'all') {
        whereClause += ` AND trangThai = ?`;
        params.push(status === 'active' ? 'Hoạt động' : 'Đã khóa');
    }

    const countSql = `SELECT COUNT(*) as total FROM KhachHang ${whereClause}`;
    const [countRows] = await db.query(countSql, params);
    const totalItems = countRows[0].total;

    const sql = `SELECT * FROM KhachHang ${whereClause} LIMIT ? OFFSET ?`;


    const [dataRows] = await db.query(sql, [...params, limit, offset]);

    return {
        data: dataRows,
        totalItems: totalItems
    };
}

module.exports = {
  findByUsername,
  findByEmail,
  findByPhone,
  createUser,
  checkPassword,
  updatePassword,
  getCustomerById,
  updateStatus,
  deleteCustomer,
  getCustomersFiltered
};
