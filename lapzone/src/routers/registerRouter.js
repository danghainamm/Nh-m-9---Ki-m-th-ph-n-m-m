const express = require('express');
const router = express.Router();
const { register } = require('../controllers/registerController');
const KHModel = require('../models/KHModel');

router.get('/', (req, res) => {
  res.render('register', { error: null, success: null });
});

for (const [route, parameter, find] of [['check-username', 'username', KHModel.findByUsername], ['check-phone', 'phone', KHModel.findByPhone], ['check-email', 'email', KHModel.findByEmail]]) {
  router.get('/' + route, async (req, res, next) => {
    try {
      if (typeof req.query[parameter] !== 'string') return res.status(400).json({ error: 'Thiếu thông tin.' });
      res.json({ exists: !!await find(req.query[parameter]) });
    } catch (error) { next(error); }
  });
}

router.post('/', register);

module.exports = router;
