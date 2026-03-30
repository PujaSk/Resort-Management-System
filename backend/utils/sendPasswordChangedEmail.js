// backend/utils/sendPasswordChangedEmail.js

const { sendEmail } = require("./mailer");

const PHONE = "94281 00000";

const sendPasswordChangedEmail = async (email, name = "User", type = "changed") => {
  const actionLabel = type === "reset" ? "reset via OTP" : "changed";
  const contactEmail = process.env.EMAIL_FROM || "royalpalace.care1@gmail.com";
  const timeStr = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "2-digit", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const html = `
  <div style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f4f1eb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1208 0%,#2d2010 50%,#1a1208 100%);padding:40px 40px 30px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;">Royal Palace Resort</p>
          <h1 style="margin:0;font-size:28px;color:#f5edd8;font-weight:700;">Password ${type === "reset" ? "Reset" : "Changed"}</h1>
          <p style="margin:10px 0 0;color:#C9A84C;font-size:14px;">✦ Security Notification ✦</p>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="background:#C9A84C;padding:12px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">🔒 Account Security Alert</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:35px 40px;">
          <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">Dear <strong>${name}</strong>,<br><br>Your <strong>Royal Palace Resort</strong> account password was successfully <strong>${actionLabel}</strong>.</p>

          <!-- Details Table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">🔐 Change Details</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;width:40%;border-bottom:1px solid #f0ebe2;">Account</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${email}</td></tr>
            <tr style="background:#fdfaf5;"><td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Time (IST)</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${timeStr}</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;">Method</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">${type === "reset" ? "OTP Verification" : "Current Password"}</td></tr>
          </table>

          <!-- Warning box -->
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;border-radius:0 8px 8px 0;margin-bottom:25px;">
            <p style="margin:0 0 6px;color:#92400e;font-size:13px;font-weight:700;">⚠ Was this not you?</p>
            <p style="margin:0;color:#666;font-size:13px;line-height:1.7;">If you did not make this change, please contact us immediately to secure your account.</p>
          </div>

          <!-- Contact -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td style="background:#f9f5ee;padding:16px 20px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#8B6914;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Contact Us</p>
              <p style="margin:0;font-size:13px;color:#555;">
                📞 <strong style="color:#1a1208;">${PHONE}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; ✉ <a href="mailto:${contactEmail}" style="color:#C9A84C;text-decoration:none;">${contactEmail}</a>
              </p>
            </td></tr>
          </table>

          <p style="color:#555;font-size:14px;margin:0;">Warm Regards,<br><strong style="color:#1a1208;">Royal Palace Resort Team</strong></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a1208;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#C9A84C;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Royal Palace Resort</p>
          <p style="margin:6px 0 0;color:#6b5c3e;font-size:11px;">© ${new Date().getFullYear()} All Rights Reserved. · Automated Security Notification</p>
        </td></tr>

      </table>
    </td></tr></table>
  </div>`;

  await sendEmail(email, `🔒 Password ${type === "reset" ? "Reset" : "Changed"} — Royal Palace Resort`, html);
  console.log(`✅ Password-changed email sent to ${email}`);
};

module.exports = sendPasswordChangedEmail;