// backend/utils/sendWalkInWelcomeEmail.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/*
  sendWalkInWelcomeEmail({
    customer,       // { name, email, phoneno, city }
    tempPassword,   // plaintext temp password generated at registration
    siteUrl,        // e.g. "https://royalpalaceresort.com"
  })

  Sent when admin registers a new walk-in guest via the OTP flow.
  Tells them their account is ready, shows their temp password,
  and asks them to change it on first login.
*/
const sendWalkInWelcomeEmail = async ({
  customer,
  tempPassword,
  siteUrl = process.env.SITE_URL || "http://localhost:5173",
}) => {
  try {
    const email = customer?.email;
    if (!email) return;

    const name    = customer?.name    || "Valued Guest";
    const loginUrl = `${siteUrl}/login`;

    const html = `
    <div style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f4f1eb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr><td align="center">
          <table width="620" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#1a1208 0%,#2d2010 50%,#1a1208 100%);padding:40px 40px 30px;text-align:center;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;">Royal Palace Resort</p>
                <h1 style="margin:0;font-size:28px;color:#f5edd8;font-weight:700;letter-spacing:1px;">Welcome to Our Family</h1>
                <p style="margin:10px 0 0;color:#C9A84C;font-size:14px;">✦ &nbsp;Your account has been created&nbsp; ✦</p>
              </td>
            </tr>

            <!-- GOLD BAND -->
            <tr>
              <td style="background:#C9A84C;padding:12px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  Account Activated — Action Required
                </p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:35px 40px;">

                <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 20px;">
                  Dear <strong>${name}</strong>,<br><br>
                  Welcome to <strong>Royal Palace Resort</strong>. Our team has registered your account
                  so you can manage your bookings, view your stay history, and share your feedback —
                  all from our website.
                </p>

                <!-- ACCOUNT CREDENTIALS -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">
                      🔑 Your Login Credentials
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;width:38%;border-bottom:1px solid #f0ebe2;">Email</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${email}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;">Temporary Password</td>
                    <td style="padding:12px 16px;">
                      <span style="font-family:monospace;font-size:18px;font-weight:800;color:#1a1208;
                        background:#f5edd8;padding:6px 14px;border-radius:6px;border:1.5px solid #C9A84C;
                        letter-spacing:0.15em;">${tempPassword}</span>
                    </td>
                  </tr>
                </table>

                <!-- ACTION REQUIRED BANNER -->
                <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:25px;">
                  <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:700;">⚠ Please Change Your Password</p>
                  <p style="margin:0;color:#666;font-size:13px;line-height:1.7;">
                    This is a <strong>temporary password</strong> generated for you by our team.
                    For your security, please log in and change it immediately.
                    Go to <strong>My Profile → Change Password</strong> after logging in.
                  </p>
                </div>

                <!-- WHAT YOU CAN DO -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">
                      🌟 What You Can Do On Our Website
                    </td>
                  </tr>
                  ${[
                    ["📋 My Bookings",    "View all your past and upcoming bookings"],
                    ["⭐ Leave Feedback", "Rate your stay and share your experience"],
                    ["❌ Manage Bookings","Cancel a booking if plans change"],
                    ["👤 My Profile",     "Update your contact details and change your password"],
                  ].map(([icon_label, desc], i) => `
                  <tr style="background:${i % 2 === 0 ? "#ffffff" : "#fdfaf5"};">
                    <td style="padding:11px 16px;color:#222;font-size:13px;font-weight:700;width:38%;border-bottom:1px solid #f0ebe2;">${icon_label}</td>
                    <td style="padding:11px 16px;color:#666;font-size:13px;border-bottom:1px solid #f0ebe2;">${desc}</td>
                  </tr>
                  `).join("")}
                </table>

                <!-- LOGIN CTA -->
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="${loginUrl}" target="_blank"
                    style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#ddb94e);
                      color:#1a1208;font-weight:800;font-size:14px;padding:14px 38px;
                      border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                    ✦ &nbsp;Login to Your Account&nbsp; ✦
                  </a>
                  <p style="margin:12px 0 0;color:#888;font-size:12px;">${loginUrl}</p>
                </div>

                <!-- ACCOUNT DETAILS -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">
                      👤 Your Profile Details
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:11px 16px;color:#888;font-size:13px;width:38%;border-bottom:1px solid #f0ebe2;">Name</td>
                    <td style="padding:11px 16px;color:#222;font-size:13px;font-weight:600;border-bottom:1px solid #f0ebe2;">${name}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:11px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Email</td>
                    <td style="padding:11px 16px;color:#222;font-size:13px;font-weight:600;border-bottom:1px solid #f0ebe2;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding:11px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Phone</td>
                    <td style="padding:11px 16px;color:#222;font-size:13px;font-weight:600;border-bottom:1px solid #f0ebe2;">${customer?.phoneno || "—"}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:11px 16px;color:#888;font-size:13px;">City</td>
                    <td style="padding:11px 16px;color:#222;font-size:13px;font-weight:600;">${customer?.city || "—"}</td>
                  </tr>
                </table>

                <p style="color:#333;font-size:14px;line-height:1.7;margin:0 0 25px;">
                  If you did not visit our resort or did not authorize this account creation,
                  please contact us immediately at
                  <a href="mailto:${process.env.EMAIL_USER}" style="color:#C9A84C;text-decoration:none;">${process.env.EMAIL_USER}</a>.
                </p>

                <p style="color:#555;font-size:14px;margin:0;">
                  Warm Regards,<br>
                  <strong style="color:#1a1208;">Royal Palace Resort Team</strong>
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#1a1208;padding:20px 40px;text-align:center;">
                <p style="margin:0;color:#C9A84C;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Royal Palace Resort</p>
                <p style="margin:6px 0 0;color:#6b5c3e;font-size:11px;">© ${new Date().getFullYear()} All Rights Reserved.</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </div>`;

    await transporter.sendMail({
      from:    `"Royal Palace Resort" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Welcome to Royal Palace Resort — Your Account is Ready`,
      html,
    });

    console.log("✅ Walk-in welcome email sent to:", email);
  } catch (err) {
    console.error("❌ Walk-in welcome email error:", err.message);
  }
};

module.exports = sendWalkInWelcomeEmail;