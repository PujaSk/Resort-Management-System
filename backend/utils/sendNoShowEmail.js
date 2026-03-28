// backend/utils/sendNoShowEmail.js

const nodemailer = require("nodemailer");

// ✅ CHANGED: was service:"gmail" — now uses Brevo SMTP
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const fmtINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

module.exports = async function sendNoShowEmail({ booking, customer }) {
  if (!customer?.email) return;

  const subject = `⚠ No-Show Recorded — Booking #${booking._id?.toString().slice(-8).toUpperCase()} | Royal Palace Resort`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0E0C09;font-family:'Georgia',serif;">
  <div style="max-width:540px;margin:32px auto;background:#161410;border:1px solid rgba(248,113,113,.25);border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1a100f 0%,#1f1410 100%);padding:28px 36px;text-align:center;border-bottom:1px solid rgba(248,113,113,.2);">
      <div style="display:inline-block;background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.3);border-radius:50%;width:52px;height:52px;line-height:52px;font-size:24px;margin-bottom:12px;">⚠</div>
      <p style="color:rgba(201,168,76,.7);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 4px;">Royal Palace Resort</p>
      <h1 style="color:#f5edd8;font-size:21px;font-weight:700;margin:0 0 4px;">No-Show Notice</h1>
      <p style="color:rgba(255,255,255,.4);font-size:12.5px;margin:0;">Your booking has expired without check-in</p>
    </div>

    <div style="padding:26px 36px;">
      <p style="color:#e8dcc8;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Dear <strong style="color:#C9A84C;">${customer.name || "Valued Guest"}</strong>,<br/>
        Our records show that you did not check in for your reservation and the booking window has now closed.
      </p>

      <div style="background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2);border-radius:10px;padding:16px 18px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${[
            ["Booking Ref",   `#${booking._id?.toString().slice(-8).toUpperCase()}`],
            ["Check-In Date", fmtDate(booking.checkInDateTime)],
            ["Check-Out Date",fmtDate(booking.checkOutDateTime)],
            ["Amount Paid",   fmtINR(booking.amountPaid || 0)],
          ].map(([l, v]) => `
            <tr>
              <td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);color:rgba(255,255,255,.4);font-size:12px;">${l}</td>
              <td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);color:#e8dcc8;font-size:12.5px;font-weight:600;text-align:right;">${v}</td>
            </tr>
          `).join("")}
        </table>
      </div>

      <div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="color:#fbbf24;font-size:13px;font-weight:700;margin:0 0 6px;">Policy Notice</p>
        <p style="color:rgba(255,255,255,.5);font-size:12.5px;line-height:1.65;margin:0;">
          Per our no-show policy, the amount paid of <strong style="color:#fbbf24;">${fmtINR(booking.amountPaid || 0)}</strong> has been retained as a no-show charge. No refund is applicable for missed reservations.
        </p>
      </div>

      <p style="color:rgba(255,255,255,.4);font-size:12.5px;line-height:1.7;margin:0 0 20px;">
        We hope to welcome you again. To make a new reservation, please visit our website or contact our front desk.
      </p>

      <div style="text-align:center;padding:14px;background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.12);border-radius:10px;">
        <p style="color:#C9A84C;font-size:13px;font-weight:700;margin:0;">
          📞 Contact Front Desk &nbsp;|&nbsp; ✉ ${process.env.EMAIL_USER}
        </p>
      </div>
    </div>

    <div style="padding:18px 36px;border-top:1px solid rgba(255,255,255,.06);text-align:center;">
      <p style="color:rgba(255,255,255,.2);font-size:11px;margin:0;">Royal Palace Resort · Automated No-Show Notification</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"Royal Palace Resort" <${process.env.EMAIL_FROM}>`,
    to:      customer.email,
    subject,
    html,
  });
};