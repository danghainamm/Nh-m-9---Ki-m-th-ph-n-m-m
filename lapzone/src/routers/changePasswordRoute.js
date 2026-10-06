const express = require('express');
const router = express.Router();
const changePasswordController = require('../controllers/changePasswordController');

router.get('/doimatkhau', changePasswordController.getChangePassword);
router.post('/doimatkhau', changePasswordController.postChangePassword);

module.exports = router;
