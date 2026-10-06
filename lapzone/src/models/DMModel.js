// models/userModel.js
const db = require('../config/db');

async function findAllCategories() {
    try {
      const [rows] = await db.query('SELECT * FROM danhmuc');
      return rows;
    } catch (error) {
      console.error('Lỗi truy vấn CSDL:', error);
      throw error;
    }
  }
  

module.exports = { findAllCategories };
