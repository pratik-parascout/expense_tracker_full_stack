const express = require('express');

const signupController = require('../controller/signup');

const router = express.Router();

router.post('/', signupController.postSignup);

router.get('/', signupController.getSignup);

module.exports = router;
