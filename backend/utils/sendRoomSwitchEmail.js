// backend/utils/sendRoomSwitchEmail.js

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
  new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  });

const fmtINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

module.exports = async function sendRoomSwitchEmail({
  booking, customer, roomType, oldRoom, newRoom, reason,
}) {
  if (!customer?.email) return;

  const subject = `🔄 Room Change Notice — ${roomType?.type_name || "Your Booking"} | Ref #${booking._id?.toString().slice(-8).toUpperCase()}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Room Change Notice</title>
</head>
<body style="margin:0;padding:0;background:#0E0C09;font-family:'Georgia',serif;">
  <div style="max-width:560px;margin:32px auto;background:#161410;border:1px solid rgba(201,168,76,.25);border-radius:16px;overflow:hidden;">

    <div style="background:linear-gradient(135deg,#1a170f 0%,#201c12 100%);padding:32px 36px;text-align:center;border-bottom:1px solid rgba(201,168,76,.2);">
      <div style="display:inline-block;background:rgba(255,165,0,.12);border:1px solid rgba(255,165,0,.3);border-radius:50%;width:56px;height:56px;line-height:56px;font-size:26px;margin-bottom:14px;">🔄</div>
      <p style="color:rgba(201,168,76,.7);font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Royal Palace Resort</p>
      <h1 style="color:#f5edd8;font-size:22px;font-weight:700;margin:0 0 6px;">Room Change Notice</h1>
      <p style="color:rgba(255,255,255,.45);font-size:13px;margin:0;">Your room assignment has been updated</p>
    </div>

    <div style="padding:28px 36px;">
      <p style="color:#e8dcc8;font-size:14.5px;line-height:1.7;margin:0 0 22px;">
        Dear <strong style="color:#C9A84C;">${customer.name || "Valued Guest"}</strong>,<br/>
        We have updated your room assignment for your upcoming stay. Please note the new room details below.
      </p>

      <div style="background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.18);border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <p style="color:rgba(255,255,255,.4);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 4px;">Booking Reference</p>
        <p style="color:#C9A84C;font-size:15px;font-weight:700;font-family:monospace;margin:0;">#${booking._id?.toString().slice(-8).toUpperCase()}</p>
      </div>

      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;margin-bottom:20px;">
        <div style="padding:12px 16px;background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.06);">
          <p style="color:rgba(255,255,255,.35);font-size:10px;letter-spacing:1.2px;text-transform:uppercase;margin:0;">Room Assignment Change</p>
        </div>
        <div style="display:flex;padding:16px;">
          <div style="flex:1;text-align:center;padding:10px;border-right:1px solid rgba(255,255,255,.06);">
            <p style="color:rgba(255,255,255,.3);font-size:10px;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Previous Room</p>
            <p style="color:rgba(248,113,113,.6);font-size:22px;font-weight:700;margin:0 0 4px;">
              ${oldRoom?.room_number ? `#${oldRoom.room_number}` : "—"}
            </p>
            ${oldRoom?.floor ? `<p style="color:rgba(255,255,255,.3);font-size:11px;margin:0;">Floor ${oldRoom.floor}</p>` : ""}
          </div>
          <div style="display:flex;align-items:center;padding:0 16px;">
            <span style="color:#C9A84C;font-size:20px;">→</span>
          </div>
          <div style="flex:1;text-align:center;padding:10px;">
            <p style="color:rgba(255,255,255,.3);font-size:10px;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">New Room</p>
            <p style="color:#4ade80;font-size:22px;font-weight:700;margin:0 0 4px;">
              #${newRoom?.room_number || "—"}
            </p>
            ${newRoom?.floor ? `<p style="color:rgba(255,255,255,.3);font-size:11px;margin:0;">Floor ${newRoom.floor}</p>` : ""}
          </div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        ${[
          ["Room Type",  roomType?.type_name || "—"],
          ["Check-In",   fmtDate(booking.checkInDateTime)],
          ["Check-Out",  fmtDate(booking.checkOutDateTime)],
          ["Reason",     reason || "Requested by management"],
        ].map(([l, v]) => `
          <tr>
            <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05);color:rgba(255,255,255,.4);font-size:12.5px;">${l}</td>
            <td style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05);color:#e8dcc8;font-size:12.5px;font-weight:600;text-align:right;">${v}</td>
          </tr>
        `).join("")}
      </table>

      <div style="background:rgba(74,222,128,.06);border:1px solid rgba(74,222,128,.2);border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <p style="color:#4ade80;font-size:13px;margin:0;line-height:1.6;">
          ✓ All your booking details, rates, and payment terms remain unchanged. Only the room number has been updated.
        </p>
      </div>

      <p style="color:rgba(255,255,255,.4);font-size:12.5px;line-height:1.7;margin:0 0 24px;">
        We apologize for any inconvenience. If you have any questions or concerns regarding this change, please contact our front desk immediately.
      </p>

      <div style="text-align:center;padding:16px;background:rgba(201,168,76,.04);border:1px solid rgba(201,168,76,.12);border-radius:10px;">
        <p style="color:rgba(255,255,255,.35);font-size:11px;margin:0 0 4px;">Questions? Contact us</p>
        <p style="color:#C9A84C;font-size:13px;font-weight:700;margin:0;">
          📞 Front Desk &nbsp;|&nbsp; ✉ ${process.env.EMAIL_USER}
        </p>
      </div>
    </div>

    <div style="padding:20px 36px;border-top:1px solid rgba(255,255,255,.06);text-align:center;">
      <p style="color:rgba(255,255,255,.2);font-size:11px;margin:0;">
        Royal Palace Resort · This is an automated notification
      </p>
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