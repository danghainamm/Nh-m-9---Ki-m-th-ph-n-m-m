const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// SQL cố định trong project; các file này không có dấu chấm phẩy trong chuỗi.
function readStatements(filename) {
  return fs.readFileSync(path.join(__dirname, '..', 'src', 'db', filename), 'utf8')
    .replace(/^\s*--.*$/gm, '')
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);
}

async function setup() {
  if (process.env.DB_NAME && process.env.DB_NAME !== 'lapzone') {
    throw new Error('Bộ SQL mẫu chỉ dùng cho DB_NAME=lapzone.');
  }
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    connectTimeout: 5000,
  });
  try {
    for (const statement of readStatements('db_init.sql')) {
      await connection.query(statement);
    }
    const [tables] = await connection.query('SHOW TABLES');
    for (const row of tables) {
      const [data] = await connection.query('SELECT 1 FROM ?? LIMIT 1', [Object.values(row)[0]]);
      if (data.length) {
        console.log('Database lapzone đã có dữ liệu. Giữ nguyên, bỏ qua nhập dữ liệu mẫu.');
        return;
      }
    }
    await connection.beginTransaction();
    try {
      for (const statement of readStatements('init_data.sql')) {
        await connection.query(statement);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }
    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM SanPham');
    console.log(`Đã khởi tạo lapzone với ${rows[0].total} sản phẩm mẫu.`);
    console.log('Tài khoản demo: user1 / 123456 (Khách hàng), admin / 123456 (Quản trị viên).');
  } finally {
    await connection.end();
  }
}

setup().catch(error => {
  console.error(`Khởi tạo thất bại (${error.code || 'ERROR'}): ${error.message}`);
  process.exitCode = 1;
});
