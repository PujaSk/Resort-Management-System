// backend/utils/sendRoomSwitchEmail.js

const { sendEmail } = require("./mailer");

const PHONE   = "94281 00000";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

module.exports = async function sendRoomSwitchEmail({ booking, customer, roomType, oldRoom, newRoom, reason }) {
  if (!customer?.email) return;
  const contactEmail = process.env.EMAIL_FROM || "royalpalace.care1@gmail.com";

  const html = `
  <div style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f4f1eb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1208 0%,#2d2010 50%,#1a1208 100%);padding:40px 40px 30px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;">Royal Palace Resort</p>
          <h1 style="margin:0;font-size:26px;color:#f5edd8;font-weight:700;">Room Change Notice</h1>
          <p style="margin:10px 0 0;color:rgba(201,168,76,.7);font-size:14px;">Your room assignment has been updated</p>
        </td></tr>

        <!-- Gold bar -->
        <tr><td style="background:#C9A84C;padding:12px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Booking Reference: ${booking._id?.toString().slice(-8).toUpperCase()}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:35px 40px;">
          <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">Dear <strong>${customer.name || "Valued Guest"}</strong>,<br><br>We have updated your room assignment for your upcoming stay at <strong>Royal Palace Resort</strong>. Please see the details below.</p>

          <!-- Room Change Visual -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td colspan="3" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">🔄 Room Assignment Change</td></tr>
            <tr>
              <td style="padding:20px 16px;text-align:center;width:40%;border-right:1px solid #f0ebe2;">
                <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Previous Room</p>
                <p style="margin:0;font-size:28px;font-weight:700;color:#c0392b;">#${oldRoom?.room_number || "—"}</p>
                ${oldRoom?.floor ? `<p style="margin:4px 0 0;font-size:12px;color:#888;">Floor ${oldRoom.floor}</p>` : ""}
              </td>
              <td style="padding:20px 8px;text-align:center;width:20%;">
                <p style="margin:0;font-size:28px;color:#C9A84C;">→</p>
              </td>
              <td style="padding:20px 16px;text-align:center;width:40%;border-left:1px solid #f0ebe2;">
                <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">New Room</p>
                <p style="margin:0;font-size:28px;font-weight:700;color:#2e7d32;">#${newRoom?.room_number || "—"}</p>
                ${newRoom?.floor ? `<p style="margin:4px 0 0;font-size:12px;color:#888;">Floor ${newRoom.floor}</p>` : ""}
              </td>
            </tr>
          </table>

          <!-- Stay Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">🛏 Stay Details</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;width:40%;border-bottom:1px solid #f0ebe2;">Room Type</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${roomType?.type_name || "—"}</td></tr>
            <tr style="background:#fdfaf5;"><td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-In</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${fmtDate(booking.checkInDateTime)}</td></tr>
            <tr><td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-Out</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${fmtDate(booking.checkOutDateTime)}</td></tr>
            <tr style="background:#fdfaf5;"><td style="padding:12px 16px;color:#888;font-size:13px;">Reason</td><td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">${reason || "Requested by management"}</td></tr>
          </table>

          <!-- Reassurance -->
          <div style="background:#e8f5e9;border-left:4px solid #4caf50;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:25px;">
            <p style="margin:0;color:#2e7d32;font-size:13px;font-weight:700;">✅ No changes to your booking</p>
            <p style="margin:6px 0 0;color:#555;font-size:13px;line-height:1.6;">All booking details, rates, and payment terms remain unchanged. Only the room number has been updated.</p>
          </div>

          <!-- Contact -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
            <tr><td style="background:#f9f5ee;padding:16px 20px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#8B6914;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Questions? Contact Us</p>
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

  await sendEmail(customer.email, `🔄 Room Change Notice — ${roomType?.type_name || "Your Booking"} | Ref #${booking._id?.toString().slice(-8).toUpperCase()}`, html);
  console.log("✅ Room switch email sent to:", customer.email);
};