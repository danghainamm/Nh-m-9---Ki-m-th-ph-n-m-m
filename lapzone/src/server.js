require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8888;
const hostname = process.env.HOST_NAME || "127.0.0.1";
const loginRouter = require("./routers/loginRouter");
const session = require("express-session");
const { randomBytes } = require('crypto');
const { requireCustomer, requireAdmin } = require('./middleware/auth');
const registerRouter = require("./routers/registerRouter");
const dashboardRouter = require("./routers/dashboardRouter");
const logoutRouter = require("./routers/logout");
const cartRouter = require("./routers/cartRouter");
const searchRouter = require("./routers/searchRouter")
const productRoutes = require("./routers/productRoutes");
const changePasswordRoute = require("./routers/changePasswordRoute")
const orderRouter = require("./routers/orderRouter");
const admin_orderRouter = require('./routers/admin_orderRouter');
const khoRouter = require('./routers/admin_warehouseRouter');
const reportRouter = require('./routers/reportRouter');
const customerRouter = require('./routers/customerRouter');
const profileRouter = require('./routers/profileRouter');
const reviewRoutes = require("./routers/reviewRoutes");

const paymentRoute = require("./routers/paymentRouter")


// Khai báo thư mục public cho CSS, JS, ảnh,...
app.use(express.static(path.join(__dirname, "public")));

// Cấu hình session
app.use(
  session({
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 },
  })
);

//Kiểm tra đã đăng nhập chưa
const checkLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

// Cấu hình EJS làm template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // thư mục chứa các file ejs
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  let externalOrigin = false;
  if (origin) {
    try { externalOrigin = new URL(origin).host !== req.get('host'); }
    catch { externalOrigin = true; }
  }
  if (externalOrigin || req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({ success: false, message: 'Yêu cầu từ trang khác không được chấp nhận.' });
  next();
});

// Sử dụng router

//Ai cũng có thể dùng
app.use("/", dashboardRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/product", productRoutes);
app.use('/search', searchRouter);


//Cần đăng nhập để dùng
app.use("/logout", logoutRouter);
//kh
app.use("/cart", requireCustomer, cartRouter);
app.use("/order", requireCustomer, orderRouter);
app.use('/profile', requireCustomer, profileRouter);
app.use("/payment", requireCustomer, paymentRoute);
app.use("/review", reviewRoutes);
app.use("/kh", requireCustomer, changePasswordRoute);
//admin
app.use('/quanlydonhang', requireAdmin, admin_orderRouter);
app.use('/quanlykho', requireAdmin, khoRouter);
app.use("/xembaocao", requireAdmin, reportRouter);
app.use("/quanlysanpham", requireAdmin, productRoutes);
app.use('/quanlytaikhoan', requireAdmin, customerRouter);

// app.use("/product", checkLogin, productRoutes); // Public product detail

app.use((req, res) => res.status(404).send('Không tìm thấy trang.'));
app.use((error, req, res, next) => {
  console.error('Request error:', error.code || error.message);
  const status = error.status || 500;
  const message = status < 500 ? error.message : 'Lỗi máy chủ. Vui lòng thử lại sau.';
  if (req.method !== 'GET') return res.status(status).json({ success: false, message });
  res.status(status).send(message);
});

// Cho phép bộ kiểm thử chạy app trên một cổng riêng.
if (require.main === module) app.listen(port, hostname, () => {
  console.log(`Server chạy tại: http://${hostname}:${port}`);
});
module.exports = app;
