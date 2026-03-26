// backend/utils/sendEmailOtp.js

const sendEmail = require("./brevoSender");

const sendEmailOtp = async (email, otp) => {
  try {
    const html = `
    <div style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#ffffff; border-radius:10px; padding:40px; box-shadow:0 5px 20px rgba(0,0,0,0.08);">
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <h2 style="margin:0; color:#2c3e50;">Royal Palace Resort</h2>
                  <p style="margin:5px 0 0; color:#888;">Luxury • Comfort • Experience</p>
                </td>
              </tr>
              <tr><td><hr style="border:none; border-top:1px solid #eee; margin:20px 0;"></td></tr>
              <tr>
                <td style="color:#333; font-size:16px; line-height:1.6;">
                  <p>Dear Guest,</p>
                  <p>We received a request to verify your email address / reset your password.
                    Please use the One-Time Password (OTP) below to continue.</p>
                  <div style="text-align:center; margin:30px 0;">
                    <span style="display:inline-block;background:#2c3e50;color:#ffffff;
                      padding:15px 30px;font-size:28px;letter-spacing:5px;
                      border-radius:8px;font-weight:bold;">${otp}</span>
                  </div>
                  <p style="text-align:center; color:#888; font-size:14px;">
                    This OTP is valid for <strong>10 minutes</strong>.
                  </p>
                  <p>If you did not request this verification, please ignore this email.
                    Your account remains secure.</p>
                  <p style="margin-top:30px;">Warm Regards,<br>
                    <strong>Royal Palace Resort Team</strong></p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:30px; text-align:center; font-size:12px; color:#aaa;">
                  © ${new Date().getFullYear()} Royal Palace Resort. All Rights Reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`;

    await sendEmail({
      to: email,
      subject: "Your OTP Code - Royal Palace Resort",
      html,
    });

    console.log("OTP sent to:", email);
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = sendEmailOtp;