require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

exports.sendResetEmail = async (email) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;

    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.SENDINBLUE_API;

    const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const emailData = {
      sender: { email: 'notparascout@gmail.com', name: 'trackall' },
      to: [{ email }],
      templateId: 1,
      params: {
        reset_url: 'http://yourwebsite.com/reset-password-link',
      },
    };

    const response = await transactionalEmailApi.sendTransacEmail(emailData);
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error.message || error);
    throw new Error('Failed to send email.');
  }
};
