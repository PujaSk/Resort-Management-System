// backend/utils/sendEmailOtp.js

const { sendEmail } = require("./mailer");

const PHONE = "94281 00000";

const sendEmailOtp = async (email, otp) => {
  try {
    const contactEmail = process.env.EMAIL_FROM || "royalpalace.care1@gmail.com";
    const html = `
    <div style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f4f1eb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

          <!-- Header -->
          <tr><td style="background:linear-gradient(135deg,#1a1208 0%,#2d2010 50%,#1a1208 100%);padding:40px 40px 30px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;">Royal Palace Resort</p>
            <h1 style="margin:0;font-size:28px;color:#f5edd8;font-weight:700;">Email Verification</h1>
            <p style="margin:10px 0 0;color:#C9A84C;font-size:14px;">✦ One-Time Password ✦</p>
          </td></tr>

          <!-- Gold bar -->
          <tr><td style="background:#C9A84C;padding:12px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Secure Verification Code</p>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:35px 40px;">
            <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">Dear Guest,<br><br>We received a request to verify your email address or reset your password for your <strong>Royal Palace Resort</strong> account. Use the OTP below to proceed.</p>

            <!-- OTP Box -->
            <div style="text-align:center;margin:30px 0;">
              <div style="display:inline-block;background:#f9f5ee;border:2px solid #C9A84C;border-radius:12px;padding:20px 40px;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#8B6914;text-transform:uppercase;">Your OTP Code</p>
                <p style="margin:0;font-size:36px;font-weight:700;color:#1a1208;letter-spacing:10px;font-family:monospace;">${otp}</p>
              </div>
            </div>

            <p style="text-align:center;color:#888;font-size:13px;margin:0 0 25px;">This OTP is valid for <strong style="color:#1a1208;">10 minutes</strong>. Do not share it with anyone.</p>

            <!-- Warning box -->
            <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:25px;">
              <p style="margin:0;color:#92400e;font-size:13px;font-weight:700;">⚠ Not you?</p>
              <p style="margin:6px 0 0;color:#666;font-size:13px;line-height:1.6;">If you did not request this, please ignore this email. Your account remains secure.</p>
            </div>

            <!-- Contact -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
              <tr><td style="background:#f9f5ee;padding:14px 20px;text-align:center;">
                <p style="margin:0;font-size:13px;color:#8B6914;font-weight:700;">Need help? Contact us</p>
                <p style="margin:6px 0 0;font-size:13px;color:#555;">
                  📞 <strong>${PHONE}</strong> &nbsp;|&nbsp; ✉ <a href="mailto:${contactEmail}" style="color:#C9A84C;text-decoration:none;">${contactEmail}</a>
                </p>
              </td></tr>
            </table>

            <p style="color:#555;font-size:14px;margin:0;">Warm Regards,<br><strong style="color:#1a1208;">Royal Palace Resort Team</strong></p>
          </td></tr>

          <!-- Footer -->
          <tr><td style="background:#1a1208;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#C9A84C;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Royal Palace Resort</p>
            <p style="margin:6px 0 0;color:#6b5c3e;font-size:11px;">© ${new Date().getFullYear()} All Rights Reserved.</p>
          </td></tr>

        </table>
      </td></tr></table>
    </div>`;

    await sendEmail(email, "Your OTP Code — Royal Palace Resort", html);
    console.log("✅ OTP sent to:", email);
  } catch (error) {
    console.error("❌ OTP email error:", error.message);
    throw error;
  }
};

module.exports = sendEmailOtp;