// backend/utils/mailer.js

const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const FROM_EMAIL = process.env.EMAIL_FROM || "royalpalace.care1@gmail.com";
const FROM_NAME  = "Royal Palace Resort";

const sendEmail = async (to, subject, html) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender      = { name: FROM_NAME, email: FROM_EMAIL };
  sendSmtpEmail.to          = [{ email: to }];
  sendSmtpEmail.subject     = subject;
  sendSmtpEmail.htmlContent = html;
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendEmail, FROM_EMAIL, FROM_NAME };