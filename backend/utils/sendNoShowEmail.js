// backend/utils/sendNoShowEmail.js

const { sendEmail } = require("./mailer");

const PHONE    = "94281 00000";
const fmtDate  = (d) => new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtINR   = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

module.exports = async function sendNoShowEmail({ booking, customer }) {
  if (!customer?.email) return;
  const contactEmail = process.env.EMAIL_FROM || "royalpalace.care1@gmail.com";

  const html = `
  <div style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f4f1eb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1208 0%,#2d2010 50%,#1a1208 100%);padding:40px 40px 30px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;">Royal Palace Resort</p>
          <h1 style="margin:0;font-size:26px;color:#f5edd8;font-weight:700;">No-Show Notice</h1>
          <p style="margin:10px 0 0;color:rgba(201,168,76,.7);font-size:14px;">Your booking has expired without check-in</p>
        </td></tr>

        <!-- Red bar -->
        <tr><td style="background:#c0392b;padding:12px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#ffffff;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Booking Reference: ${booking._id?.toString().slice(-8).toUpperCase()} — NO SHOW</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:35px 40px;">
          <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">Dear <strong>${customer.name || "Valued Guest"}</strong>,<br><br>Our records show that you did not check in for your reservation and the booking window has now closed.</p>

          <!-- Booking Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">🛏 Booking Details</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;width:45%;border-bottom:1px solid #f0ebe2;">Booking Reference</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">#${booking._id?.toString().slice(-8).toUpperCase()}</td></tr>
            <tr style="background:#fdfaf5;"><td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-In Date</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${fmtDate(booking.checkInDateTime)}</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-Out Date</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${fmtDate(booking.checkOutDateTime)}</td></tr>
            <tr style="background:#fdfaf5;"><td style="padding:12px 16px;color:#888;font-size:13px;">Amount Paid</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">${fmtINR(booking.amountPaid || 0)}</td></tr>
          </table>

          <!-- Policy Notice -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #fde68a;">
            <tr><td colspan="2" style="background:#fef3c7;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#92400e;font-weight:700;text-transform:uppercase;border-bottom:1px solid #fde68a;">⚠ No-Show Policy</td></tr>
            <tr><td style="padding:14px 16px;color:#666;font-size:13px;line-height:1.7;">
              Per our no-show policy, the amount paid of <strong style="color:#d97706;">${fmtINR(booking.amountPaid || 0)}</strong> has been retained. No refund is applicable for missed reservations.<br><br>
              If you believe this is an error or had an emergency, please contact us immediately.
            </td></tr>
          </table>

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
          <p style="margin:6px 0 0;color:#6b5c3e;font-size:11px;">© ${new Date().getFullYear()} All Rights Reserved.</p>
        </td></tr>

      </table>
    </td></tr></table>
  </div>`;

  await sendEmail(customer.email, `⚠ No-Show Recorded — Booking #${booking._id?.toString().slice(-8).toUpperCase()} | Royal Palace Resort`, html);
  console.log("✅ No-show email sent to:", customer.email);
};