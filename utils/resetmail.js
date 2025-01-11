require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

exports.sendResetEmail = async (email, id) => {
  // Pass id as parameter
  try {
    const client = SibApiV3Sdk.ApiClient.instance;

    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.SENDINBLUE_API;

    const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    // Create the reset URL dynamically using the id
    const resetUrl = `http://13.126.130.202:3000/password/resetpassword/${id}`;

    const emailData = {
      sender: { email: 'notparascout@gmail.com', name: 'trackall' },
      to: [{ email }],
      subject: 'Password Reset Request',
      textContent: `Hello,\n\nHere is your password reset link:\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe TrackAll Team`,
    };

    const response = await transactionalEmailApi.sendTransacEmail(emailData);
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error.message || error);
    throw new Error('Failed to send email.');
  }
};
