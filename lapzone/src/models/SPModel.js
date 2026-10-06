const db = require("../config/db");

async function findAllProducts() {
  try {
    const [rows] = await db.query("SELECT * FROM sanPham");
    return rows;
  } catch (error) {
    console.error("Lỗi truy vấn CSDL:", error);
    throw error;
  }
}

// Tìm sản phẩm theo từ khóa
async function searchProducts(keyword) {
  try {
    const sql = `
      SELECT sp.*, dm.tenDanhMuc AS tenDM
      FROM sanPham sp
      INNER JOIN DanhMuc dm ON sp.maDanhMuc = dm.maDanhMuc
      WHERE sp.tenSanPham LIKE ? OR dm.tenDanhMuc LIKE ? OR sp.maSanPham LIKE ? OR sp.thuonghieu LIKE ?
    `;
    const likeKeyword = `%${keyword}%`;
    const [rows] = await db.query(sql, [
      likeKeyword,
      likeKeyword,
      likeKeyword,
      likeKeyword,
    ]);
    return rows;
  } catch (error) {
    console.error("Lỗi truy vấn CSDL:", error);
    throw error;
  }
}

async function viewProductByCategorie(maDanhMuc) {
  try {
    const sql = `
      SELECT
        sp.*,
        dm.tenDanhMuc AS tenDM
      FROM sanPham sp
      INNER JOIN DanhMuc dm ON sp.maDanhMuc = dm.maDanhMuc
      WHERE sp.maDanhMuc = ?
    `;

    const [rows] = await db.query(sql, [maDanhMuc]);
    return rows; // trả về danh sách sản phẩm trong danh mục
  } catch (error) {
    console.error("Lỗi truy vấn viewProductByCategorie:", error);
    throw error;
  }
}

async function searchWithFilters(f) {
  try {
    let sql = `
      SELECT sp.*, dm.tenDanhMuc AS tenDM, tskt.*
      FROM sanPham sp
      INNER JOIN DanhMuc dm ON sp.maDanhMuc = dm.maDanhMuc
      INNER JOIN thongSoKyThuat tskt ON tskt.maSanPham = sp.maSanPham
      WHERE (LOWER(sp.tenSanPham) LIKE ? OR LOWER(dm.tenDanhMuc) LIKE ?)
    `;

    const keyword = `%${f.keyword || ""}%`;
    const params = [keyword, keyword];

    // Hàm phụ xử lý filter nhiều giá trị
    const appendMultiFilter = (column, values, isLike = true) => {
      if (!values) return;
      const arr = Array.isArray(values) ? values : [values];
      if (arr.length === 0) return;

      const placeholders = arr
        .map(() => (isLike ? `${column} LIKE ?` : `${column} = ?`))
        .join(" OR ");
      sql += ` AND (${placeholders})`;
      arr.forEach((v) => params.push(isLike ? `%${v.toLowerCase()}%` : v));
    };

    // Áp dụng filter
    appendMultiFilter("LOWER(sp.thuongHieu)", f.brand); // brand
    appendMultiFilter("LOWER(dm.tenDanhMuc)", f.category); // ví dụ: ai khớp Laptop AI
    appendMultiFilter("LOWER(tskt.cpu)", f.cpu); // cpu
    appendMultiFilter("LOWER(tskt.ram)", f.ram); // ram
    appendMultiFilter("LOWER(tskt.rom)", f.storage); // storage
    appendMultiFilter("LOWER(tskt.doPhanGiaiMH)", f.resolution); // resolution

    // Khoảng giá
    sql += " AND sp.giaBan BETWEEN ? AND ?";
    params.push(Number(f.minPrice) || 0);
    params.push(Number(f.maxPrice) || 9999999999);

    // Sắp xếp
    if (f.sort === "price_asc") sql += " ORDER BY sp.giaBan ASC";
    else if (f.sort === "price_desc") sql += " ORDER BY sp.giaBan DESC";

    // Lấy dữ liệu từ DB
    let [rows] = await db.query(sql, params);

    // Filter kích thước màn hình
    if (f.size) {
      const sizes = Array.isArray(f.size) ? f.size : [f.size];
      rows = rows.filter((p) => {
        if (!p.kichThuocMH) return false;
        const sizeNum = parseFloat(p.kichThuocMH.replace(/"/g, ""));
        return sizes.some((sz) => {
          switch (sz) {
            case "13":
              return sizeNum >= 13 && sizeNum < 14;
            case "14":
              return sizeNum >= 14 && sizeNum < 15;
            case "15+":
              return sizeNum >= 15;
            default:
              return true;
          }
        });
      });
    }

    return rows;
  } catch (error) {
    console.error("Lỗi searchWithFilters:", error);
    throw error;
  }
}

async function findById(maSanPham) {
  const [rows] = await db.query('SELECT tskt.*, sp.*, sp.thuongHieu AS thuonghieu FROM SanPham sp LEFT JOIN ThongSoKyThuat tskt ON tskt.maSanPham = sp.maSanPham WHERE sp.maSanPham = ?', [maSanPham]);
  return rows[0] || null;
}

async function findAllCategories() {
  try {
    const [rows] = await db.query("SELECT * FROM DanhMuc");
    return rows;
  } catch (error) {
    console.error("Lỗi truy vấn danh mục:", error);
    throw error;
  }
}

async function createProduct(data) {
  const {
    maSanPham,
    tenSanPham,
    thuonghieu,
    tinhTrang,
    soLuongTon,
    giaBan,
    moTa,
    anhMinhHoaSP,
    maDanhMuc,
    ram,
    rom,
    cpu,
    cardDH,
    soKheRam,
    kichThuocMH,
    pin,
    hdh,
    congNgheMH,
    doPhanGiaiMH,
    port,
  } = data;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const sqlProduct = `INSERT INTO sanPham (maSanPham, tenSanPham, thuonghieu, tinhTrang, soLuongTon, giaBan, moTa, anhMinhHoaSP, maDanhMuc, giaNhap)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await connection.query(sqlProduct, [
      maSanPham,
      tenSanPham,
      thuonghieu,
      tinhTrang,
      soLuongTon,
      giaBan,
      moTa,
      anhMinhHoaSP,
      maDanhMuc,
      Number(data.giaNhap) || 0,
    ]);

    const sqlSpecs = `INSERT INTO thongSoKyThuat (maSanPham, ram, rom, cpu, cardDH, soKheRam, kichThuocMH, pin, hdh, congNgheMH, doPhanGiaiMH, port)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await connection.query(sqlSpecs, [
      maSanPham,
      ram,
      rom,
      cpu,
      cardDH,
      soKheRam,
      kichThuocMH,
      pin,
      hdh,
      congNgheMH,
      doPhanGiaiMH,
      port,
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateProduct(maSanPham, data) {
  const {
    tenSanPham,
    thuonghieu,
    tinhTrang,
    soLuongTon,
    giaBan,
    moTa,
    anhMinhHoaSP,
    maDanhMuc,
    ram,
    rom,
    cpu,
    cardDH,
    soKheRam,
    kichThuocMH,
    pin,
    hdh,
    congNgheMH,
    doPhanGiaiMH,
    port,
  } = data;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const sqlProduct = `UPDATE sanPham SET tenSanPham = ?, thuonghieu = ?, tinhTrang = ?, soLuongTon = ?, giaBan = ?, moTa = ?, anhMinhHoaSP = ?, maDanhMuc = ?, giaNhap = ? WHERE maSanPham = ?`;
    await connection.query(sqlProduct, [
      tenSanPham,
      thuonghieu,
      tinhTrang,
      soLuongTon,
      giaBan,
      moTa,
      anhMinhHoaSP,
      maDanhMuc,
      Number(data.giaNhap) || 0,
      maSanPham,
    ]);

    // Check if specs exist
    const [specs] = await connection.query(
      "SELECT * FROM thongSoKyThuat WHERE maSanPham = ?",
      [maSanPham]
    );

    if (specs.length > 0) {
      const sqlSpecs = `UPDATE thongSoKyThuat SET ram = ?, rom = ?, cpu = ?, cardDH = ?, soKheRam = ?, kichThuocMH = ?, pin = ?, hdh = ?, congNgheMH = ?, doPhanGiaiMH = ?, port = ? WHERE maSanPham = ?`;
      await connection.query(sqlSpecs, [
        ram,
        rom,
        cpu,
        cardDH,
        soKheRam,
        kichThuocMH,
        pin,
        hdh,
        congNgheMH,
        doPhanGiaiMH,
        port,
        maSanPham,
      ]);
    } else {
      const sqlSpecs = `INSERT INTO thongSoKyThuat (maSanPham, ram, rom, cpu, cardDH, soKheRam, kichThuocMH, pin, hdh, congNgheMH, doPhanGiaiMH, port)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.query(sqlSpecs, [
        maSanPham,
        ram,
        rom,
        cpu,
        cardDH,
        soKheRam,
        kichThuocMH,
        pin,
        hdh,
        congNgheMH,
        doPhanGiaiMH,
        port,
      ]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Delete a product
async function deleteProduct(maSanPham) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [history] = await connection.query('SELECT maChiTiet FROM ChiTietDonHang WHERE maSanPham = ? LIMIT 1', [maSanPham]);
    if (history.length) throw require('../utils/validation').fail('Sản phẩm đã có đơn hàng. Hãy đặt tồn kho về 0 thay vì xóa lịch sử.', 409);
    // Delete specs first (foreign key constraint usually requires this, or cascade delete)
    await connection.query("DELETE FROM thongSoKyThuat WHERE maSanPham = ?", [
      maSanPham,
    ]);
    await connection.query("DELETE FROM sanPham WHERE maSanPham = ?", [
      maSanPham,
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getProductStatistics() {
  const sql = `
    SELECT
      COUNT(*) AS totalProducts,
      SUM(soLuongTon) AS totalStock,
      AVG(giaBan) AS avgPrice
    FROM sanPham`;
  const [rows] = await db.query(sql);
  return rows[0];
}

async function getStockByProductId(maSanPham) {
  const [rows] = await db.query(
    "SELECT soLuongTon FROM sanPham WHERE maSanPham = ?",
    [maSanPham]
  );

  if (rows.length === 0) return null;
  return rows[0].soLuongTon;
}

async function checkProductExists(maSanPham) {
  try {
    const [rows] = await db.query(
      "SELECT maSanPham FROM sanPham WHERE maSanPham = ?",
      [maSanPham]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Lỗi kiểm tra sản phẩm tồn tại:", error);
    throw error;
  }
}

// Export kiểu module.exports
module.exports = {
  findAllProducts,
  searchProducts,
  findById,
  viewProductByCategorie,
  findAllCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStatistics,
  searchWithFilters,
  getStockByProductId,
  checkProductExists,
};
