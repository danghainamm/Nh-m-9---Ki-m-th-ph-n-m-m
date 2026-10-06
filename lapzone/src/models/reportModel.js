const db = require('../config/db');

async function getReportStats(filters = {}) {
  const { year, month, week, date, weekInput, monthInput, yearInput } = filters;

  // --- 1. Identify Context for SUMMARIES (Top 5, Orders, etc.) ---
  // User requested these NOT to update with chart filters.
  // We keep them as "All Time" or default view (no WHERE clause based on filters).

  let summaryCondition = "";
  let summaryParams = [];

  // Previous logic removed to decouple summaries from chart filters.


  // --- 2. Total Stats Queries (Using Summary Context) ---

  const [productRows] = await db.query(`
    SELECT
      COUNT(*) AS totalProducts,
      COALESCE(SUM(soLuongTon), 0) AS totalStock,
      COALESCE(AVG(giaBan), 0) AS avgPrice
    FROM sanPham
  `);
  const productStats = productRows[0] || { totalProducts: 0, totalStock: 0, avgPrice: 0 };

  const orderQuery = `
    SELECT
      COALESCE(COUNT(*), 0) AS totalOrders,
      COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS totalRevenue
    FROM DonHang
    WHERE 1=1 ${summaryCondition}
  `;
  const [orderSummaryRows] = await db.query(orderQuery, summaryParams);
  const orderSummary = orderSummaryRows[0] || { totalOrders: 0, totalRevenue: 0 };

  const statusQuery = `
    SELECT
      trangThai AS status,
      COUNT(*) AS count,
      COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
    FROM DonHang
    WHERE 1=1 ${summaryCondition}
    GROUP BY trangThai
  `;
  const [orderStatusRows] = await db.query(statusQuery, summaryParams);


  // --- 3. Independent Chart Queries (Decoupled) ---

  // A. Daily Revenue
  // ONLY listens to 'date'. Ignores Week/Month/Year.
  let dailyQuery = "";
  let dailyParams = [];

  if (date) {
    dailyQuery = `
        SELECT
            DATE_FORMAT(ngayDatHang, '%d/%m/%Y') AS day,
            DATE(ngayDatHang) as dateVal,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE DATE(ngayDatHang) = ?
        GROUP BY dateVal, day
    `;
    dailyParams = [date];
  } else {
    // Default (Last 7 days)
    dailyQuery = `
        SELECT
            DATE_FORMAT(ngayDatHang, '%d/%m/%Y') AS day,
            DATE(ngayDatHang) as dateVal,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE ngayDatHang >= DATE(NOW()) - INTERVAL 7 DAY
        GROUP BY dateVal, day
        ORDER BY dateVal DESC
    `;
  }
  const [dailyRevenueRows] = await db.query(dailyQuery, dailyParams);
  let dailyRevenue = dailyRevenueRows;
  if (!date) dailyRevenue = dailyRevenue.map(x => x).reverse();


  // B. Weekly Revenue
  // ONLY listens to 'week'. Ignores Date/Month/Year.
  let weeklyQuery = "";
  let weeklyParams = [];

  if (weekInput) {
    const [wYear, wWeek] = weekInput.split('-W');
    weeklyQuery = `
        SELECT
            DATE_FORMAT(ngayDatHang, '%u/%Y') AS weekYear,
            CONCAT('Tuần ', WEEK(ngayDatHang, 1), '/', YEAR(ngayDatHang)) AS weekLabel,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE YEAR(ngayDatHang) = ? AND WEEK(ngayDatHang, 1) = ?
        GROUP BY weekYear, weekLabel
    `;
    weeklyParams = [wYear, wWeek];
  } else if (week && year && !month) { // Ensure it's a Week filter, not Month+Year interpreted as Week
    // Wait, 'week' param usually comes distinct.
    weeklyQuery = `
        SELECT
            DATE_FORMAT(ngayDatHang, '%u/%Y') AS weekYear,
            CONCAT('Tuần ', WEEK(ngayDatHang, 1), '/', YEAR(ngayDatHang)) AS weekLabel,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE YEAR(ngayDatHang) = ? AND WEEK(ngayDatHang, 1) = ?
        GROUP BY weekYear, weekLabel
    `;
    weeklyParams = [year, week];
  } else {
    // Default (Last 4 weeks)
    weeklyQuery = `
        SELECT
            DATE_FORMAT(ngayDatHang, '%u/%Y') AS weekYear,
            CONCAT('Tuần ', WEEK(ngayDatHang, 1), '/', YEAR(ngayDatHang)) AS weekLabel,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE ngayDatHang >= DATE(NOW()) - INTERVAL 4 WEEK
        GROUP BY weekYear, weekLabel
        ORDER BY weekYear DESC
    `;
  }
  const [weeklyRevenueRows] = await db.query(weeklyQuery, weeklyParams);
  let weeklyRevenue = weeklyRevenueRows;
  if (!weekInput && !(week && year && !month)) weeklyRevenue = weeklyRevenue.map(x => x).reverse();


  // C. Monthly Revenue
  // ONLY listens to 'month'. Ignores Date/Week/Year.
  let monthlyQuery = "";
  let monthlyParams = [];

  if (monthInput) {
    const [mYear, mMonth] = monthInput.split('-');
    monthlyQuery = `
        SELECT
            DATE_FORMAT(ngayDatHang, '%m/%Y') AS month,
            DATE_FORMAT(ngayDatHang, '%Y-%m') AS yearMonth,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE YEAR(ngayDatHang) = ? AND MONTH(ngayDatHang) = ?
        GROUP BY yearMonth, month
    `;
    monthlyParams = [mYear, mMonth];
  } else if (month && year && !week) {
    monthlyQuery = `
        SELECT
            DATE_FORMAT(ngayDatHang, '%m/%Y') AS month,
            DATE_FORMAT(ngayDatHang, '%Y-%m') AS yearMonth,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE YEAR(ngayDatHang) = ? AND MONTH(ngayDatHang) = ?
        GROUP BY yearMonth, month
    `;
    monthlyParams = [year, month];
  } else {
    // Default (Last 6 months)
    monthlyQuery = `
        SELECT
            DATE_FORMAT(ngayDatHang, '%m/%Y') AS month,
            DATE_FORMAT(ngayDatHang, '%Y-%m') AS yearMonth,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE ngayDatHang >= DATE(NOW()) - INTERVAL 6 MONTH
        GROUP BY yearMonth, month
        ORDER BY yearMonth DESC
    `;
  }
  const [monthlyRevenueRows] = await db.query(monthlyQuery, monthlyParams);
  let monthlyRevenue = monthlyRevenueRows;
  if (!monthInput && !(month && year && !week)) monthlyRevenue = monthlyRevenue.map(x => x).reverse();


  // D. Yearly Revenue
  // ONLY listens to 'year'.
  let yearlyQuery = "";
  let yearlyParams = [];

  if (yearInput) {
    yearlyQuery = `
        SELECT
            YEAR(ngayDatHang) AS year,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE YEAR(ngayDatHang) = ?
        GROUP BY year
    `;
    yearlyParams = [yearInput];
  } else if (year && !month && !week && !date) {
    yearlyQuery = `
        SELECT
            YEAR(ngayDatHang) AS year,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        WHERE YEAR(ngayDatHang) = ?
        GROUP BY year
    `;
    yearlyParams = [year];
  } else {
    // Default 5 years
    yearlyQuery = `
        SELECT
            YEAR(ngayDatHang) AS year,
            COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
        FROM DonHang
        GROUP BY year
        ORDER BY year DESC
        LIMIT 5
    `;
  }
  const [yearlyRevenueRows] = await db.query(yearlyQuery, yearlyParams);
  let yearlyRevenue = yearlyRevenueRows;
  if (!yearInput && (!year || month || week || date)) yearlyRevenue = yearlyRevenue.map(x => x).reverse();


  // Today Context
  const [todayRevenueRow] = await db.query(`
    SELECT COALESCE(SUM(CASE WHEN trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') THEN tongGiaTri ELSE 0 END), 0) AS revenue
    FROM DonHang
    WHERE DATE(ngayDatHang) = CURDATE()
  `);


  // Top Stats & Recent Orders (Use Summary Condition)
  let topProductsRows = [];
  try {
    const topProdQuery = `
      SELECT
        sp.tenSanPham,
        SUM(ctdh.soLuong) AS totalSold,
        SUM(ctdh.soLuong * ctdh.donGia) AS totalRevenue
      FROM ChiTietDonHang ctdh
      JOIN sanPham sp ON ctdh.maSanPham = sp.maSanPham
      JOIN DonHang dh ON ctdh.maDonHang = dh.maDonHang
      WHERE dh.trangThai IN ('Hoàn thành', 'Đã giao', 'Đã giao hàng') ${summaryCondition}
      GROUP BY ctdh.maSanPham, sp.tenSanPham
      ORDER BY totalSold DESC
      LIMIT 5
    `;
    const [rows] = await db.query(topProdQuery, summaryParams);
    topProductsRows = rows;
  } catch (err) {
    console.error('Error fetching top products:', err);
  }

  let recentOrdersRows = [];
  try {
    const recentOrderQuery = `
      SELECT
        maDonHang,
        ngayDatHang,
        tongGiaTri,
        trangThai
      FROM DonHang
      WHERE 1=1 ${summaryCondition}
      ORDER BY ngayDatHang DESC
      LIMIT 5
    `;
    const [rows] = await db.query(recentOrderQuery, summaryParams);
    recentOrdersRows = rows;
  } catch (err) {
    console.error('Error fetching recent orders:', err);
  }

  return {
    productStats,
    orderSummary,
    orderStatus: orderStatusRows,
    monthlyRevenue,
    topProducts: topProductsRows,
    recentOrders: recentOrdersRows,
    dailyRevenue,
    weeklyRevenue,
    yearlyRevenue,
    todayRevenue: todayRevenueRow[0]?.revenue || 0
  };
}

module.exports = { getReportStats };
