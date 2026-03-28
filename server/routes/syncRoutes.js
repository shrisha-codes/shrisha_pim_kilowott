const express = require('express');
const router = express.Router();
const { pullFromWoo, pushToWoo, pushAllToWoo } = require('../controllers/syncController');

router.post('/pull',        pullFromWoo);
router.post('/push/:id',    pushToWoo);
router.post('/push-all',    pushAllToWoo);

module.exports = router;
