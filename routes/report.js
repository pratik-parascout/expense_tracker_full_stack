const express = require('express');

const reportController = require('../controller/report');

const router = express.Router();

router.get('/', reportController.getReport);

module.exports = router;
