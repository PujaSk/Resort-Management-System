// backend/utils/sendStaffWelcomeEmail.js

const { sendEmail } = require("./mailer");

const PHONE = "94281 00000";
const DESIGNATION_EMOJI = { Manager: "👔", Receptionist: "🎯", Housekeeping: "🧹", Chef: "👨‍🍳", Security: "🛡️" };

module.exports = async function sendStaffWelcomeEmail({ staff, tempPassword }) {
  const siteUrl     = process.env.SITE_URL || "http://localhost:5173";
  const loginUrl    = `${siteUrl}/login`;
  const contactEmail = process.env.EMAIL_FROM || "royalpalace.care1@gmail.com";
  const emoji       = DESIGNATION_EMOJI[staff.designation] || "👤";
  const joiningDate = new Date(staff.joining_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const html = `
  <div style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f4f1eb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1208 0%,#2d2010 50%,#1a1208 100%);padding:40px 40px 30px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;">Royal Palace Resort</p>
          <h1 style="margin:0;font-size:28px;color:#f5edd8;font-weight:700;">Welcome to the Team ${emoji}</h1>
          <p style="margin:10px 0 0;color:#C9A84C;font-size:14px;">✦ Your staff account is ready ✦</p>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="background:#C9A84C;padding:12px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${emoji} ${staff.designation} — Staff Portal Access</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:35px 40px;">
          <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">Hi <strong>${staff.staff_name}</strong>,<br><br>Welcome to <strong>Royal Palace Resort</strong>! Your staff account has been created. Please find your login credentials and details below.</p>

          <!-- Login Credentials -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">🔑 Your Login Credentials</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;width:40%;border-bottom:1px solid #f0ebe2;">Email</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${staff.email}</td></tr>
            <tr style="background:#fdfaf5;"><td style="padding:12px 16px;color:#888;font-size:13px;">Temporary Password</td>
            <td style="padding:12px 16px;">
              <span style="font-family:monospace;font-size:18px;font-weight:800;color:#1a1208;background:#f5edd8;padding:6px 14px;border-radius:6px;border:1.5px solid #C9A84C;letter-spacing:0.15em;">${tempPassword}</span>
            </td></tr>
          </table>

          <!-- Staff Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">👤 Your Details</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;width:40%;border-bottom:1px solid #f0ebe2;">Designation</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${emoji} ${staff.designation}</td></tr>
            <tr style="background:#fdfaf5;"><td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Joining Date</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${joiningDate}</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Shift</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${staff.shift}</td></tr>
            <tr style="background:#fdfaf5;"><td style="padding:12px 16px;color:#888;font-size:13px;">Phone</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">${staff.phoneno || "—"}</td></tr>
          </table>

          <!-- Warning -->
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;border-radius:0 8px 8px 0;margin-bottom:25px;">
            <p style="margin:0 0 6px;color:#92400e;font-size:13px;font-weight:700;">⚠ Important — Change Your Password</p>
            <p style="margin:0;color:#666;font-size:13px;line-height:1.7;">This is a <strong>temporary password</strong>. Please log in and change it immediately via <strong>My Profile → Change Password</strong> for security.</p>
          </div>

          <!-- Login Button -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${loginUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#ddb94e);color:#1a1208;font-weight:800;font-size:14px;padding:14px 38px;border-radius:8px;text-decoration:none;">Login to Staff Portal →</a>
            <p style="margin:10px 0 0;color:#888;font-size:12px;">${loginUrl}</p>
          </div>

          <!-- Contact -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td style="background:#f9f5ee;padding:16px 20px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#8B6914;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Need Help?</p>
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
          <p style="margin:6px 0 0;color:#6b5c3e;font-size:11px;">© ${new Date().getFullYear()} All Rights Reserved. · Staff Portal</p>
        </td></tr>

      </table>
    </td></tr></table>
  </div>`;

  await sendEmail(staff.email, `Welcome to Royal Palace Resort — Your Staff Login Details`, html);
  console.log("✅ Staff welcome email sent to:", staff.email);
};