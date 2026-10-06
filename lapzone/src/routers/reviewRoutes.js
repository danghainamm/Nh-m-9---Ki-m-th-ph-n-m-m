const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");

router.post("/add", require('../middleware/auth').requireCustomer, ReviewController.addReview);
router.get('/can-review/:maSanPham', ReviewController.checkCanReview);
router.get("/list/:maSanPham", ReviewController.getReviews);
router.get("/stats/:maSanPham", ReviewController.getReviewStats);

module.exports = router;
