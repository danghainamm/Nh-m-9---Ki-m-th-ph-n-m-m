const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
router.use(require('../middleware/auth').requireAdmin);

router.post('/xoa/:slug', customerController.deleteUser);
router.post('/trangthai/:slug', customerController.reverseStatus);
router.get('/chitiettaikhoan/:slug', customerController.profile);
router.get('/', customerController.list);

module.exports = router;
