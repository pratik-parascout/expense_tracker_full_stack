const express = require('express');
const router = express.Router();
const forgetPasswordController = require('../controller/forgetpassword');

router.post('/forgetpassword', forgetPasswordController.forgotPassword);
router.get('/forgetpassword', forgetPasswordController.getForm);
router.get('/resetpassword/:id', forgetPasswordController.getResetForm);
router.post('/resetpassword/:id', forgetPasswordController.resetPassword);

module.exports = router;
