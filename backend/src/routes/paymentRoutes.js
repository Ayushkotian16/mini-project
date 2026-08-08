const express = require('express');
const router = express.Router();
const { getConfig, createOrder, verifyPayment } = require('../controllers/paymentController');

router.get('/config', getConfig);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
