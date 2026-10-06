// src/routers/cartRouter.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

//  Hiển thị trang giỏ hàng
router.get("/", cartController.viewCart);

//  Thêm sản phẩm vào giỏ hàng (sử dụng query string)
router.get('/add', (req, res) => res.status(405).send('Vui lòng thêm sản phẩm bằng nút trên trang web.'));

//  Cập nhật số lượng sản phẩm (sử dụng query string)
router.get('/update', (req, res) => res.status(405).send('Vui lòng cập nhật giỏ hàng bằng nút trên trang web.'));

//  Xóa sản phẩm khỏi giỏ hàng (sử dụng query string)
router.get('/remove', (req, res) => res.status(405).send('Vui lòng xóa sản phẩm bằng nút trên trang web.'));
router.post('/add', cartController.addItem);
router.post('/update', cartController.updateItem);
router.post('/remove', cartController.removeItem);

module.exports = router;
