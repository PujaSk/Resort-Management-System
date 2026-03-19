// backend/utils/sendCheckInEmail.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const fmt     = (n) => Number(n).toLocaleString("en-IN");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

const METHOD_LABEL = {
  cash:        "💵 Cash",
  upi:         "📱 UPI",
  credit_card: "💳 Credit Card",
  debit_card:  "🏧 Debit Card",
};

/*
  sendCheckInEmail({
    booking,           // populated booking doc
    customer,          // customer doc
    roomType,          // roomType doc
    isHallBk,          // bool
    collectedNow,      // bool — was payment collected at check-in?
    amountCollected,   // number — amount collected (0 if deferred)
    paymentMethod,     // string | null
    upiId,             // string | null
    cardNumber,        // last-4 string | null
    amountDeferredToCheckout, // number — still due at checkout
  })
*/
const sendCheckInEmail = async ({
  booking,
  customer,
  roomType,
  isHallBk             = false,
  collectedNow         = false,
  amountCollected      = 0,
  paymentMethod        = null,
  upiId                = null,
  cardNumber           = null,
  amountDeferredToCheckout = 0,
}) => {
  try {
    const name      = customer?.name   || "Valued Guest";
    const email     = customer?.email;
    if (!email) return;

    const refId     = booking._id?.toString().slice(-8).toUpperCase();
    const eventDate = fmtDate(booking.checkInDateTime);
    const coDate    = isHallBk ? eventDate : fmtDate(booking.checkOutDateTime);
    const nights    = isHallBk ? null
      : Math.round((new Date(booking.checkOutDateTime) - new Date(booking.checkInDateTime)) / 86400000);

    /* payment method display */
    let methodStr = paymentMethod ? (METHOD_LABEL[paymentMethod] || paymentMethod) : "—";
    if (paymentMethod === "upi" && upiId)                   methodStr += ` — <strong>${upiId}</strong>`;
    if ((paymentMethod === "credit_card" || paymentMethod === "debit_card") && cardNumber)
      methodStr += ` ending in <strong>****${cardNumber}</strong>`;

    /* payment row block */
    const paymentBlock = collectedNow && amountCollected > 0 ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
        <tr>
          <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">💰 Payment Collected at Check-In</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#888;font-size:13px;width:45%;border-bottom:1px solid #f0ebe2;">Amount Collected</td>
          <td style="padding:12px 16px;color:#2e7d32;font-size:14px;font-weight:700;border-bottom:1px solid #f0ebe2;">₹${fmt(amountCollected)}</td>
        </tr>
        <tr style="background:#fdfaf5;">
          <td style="padding:12px 16px;color:#888;font-size:13px;">Payment Method</td>
          <td style="padding:12px 16px;color:#222;font-size:13px;">${methodStr}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#888;font-size:13px;border-top:1px solid #f0ebe2;">Balance Remaining</td>
          <td style="padding:12px 16px;color:#2e7d32;font-size:13px;font-weight:700;border-top:1px solid #f0ebe2;">₹0 — Fully Paid</td>
        </tr>
      </table>
    ` : amountDeferredToCheckout > 0 ? `
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0 0 6px;color:#92400e;font-size:13px;font-weight:700;">⚡ Balance Due at Check-Out</p>
        <p style="margin:0;color:#666;font-size:13px;line-height:1.6;">
          <strong style="color:#d97706;">₹${fmt(amountDeferredToCheckout)}</strong> is due at checkout.
          Please have your preferred payment method ready at the front desk before departure.
        </p>
      </div>
    ` : `
      <div style="background:#e8f5e9;border-left:4px solid #4caf50;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0;color:#2e7d32;font-size:13px;font-weight:700;">✅ Payment Fully Settled</p>
      </div>
    `;

    const stayBlock = isHallBk ? `
      <tr>
        <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Event Date</td>
        <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${eventDate}</td>
      </tr>
      <tr style="background:#fdfaf5;">
        <td style="padding:12px 16px;color:#888;font-size:13px;">Venue</td>
        <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">${roomType?.type_name || "—"}</td>
      </tr>
    ` : `
      <tr>
        <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Room Type</td>
        <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${roomType?.type_name || "—"}</td>
      </tr>
      <tr style="background:#fdfaf5;">
        <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Room Number</td>
        <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">
          Room ${booking.room?.room_number || "—"} &nbsp;•&nbsp; Floor ${booking.room?.floor || "—"}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-In</td>
        <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${eventDate}</td>
      </tr>
      <tr style="background:#fdfaf5;">
        <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-Out</td>
        <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${coDate} <span style="color:#888;font-weight:400;">(by 8:00 AM)</span></td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#888;font-size:13px;">Duration</td>
        <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">${nights} Night${nights !== 1 ? "s" : ""}</td>
      </tr>
    `;

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
                <h1 style="margin:0;font-size:28px;color:#f5edd8;font-weight:700;letter-spacing:1px;">
                  ${isHallBk ? "Venue Access Confirmed" : "Welcome — You're Checked In!"}
                </h1>
                <p style="margin:10px 0 0;color:#C9A84C;font-size:14px;">
                  ${isHallBk ? "✦ &nbsp;Your venue is ready&nbsp; ✦" : "✦ &nbsp;Your stay begins now&nbsp; ✦"}
                </p>
              </td>
            </tr>

            <!-- REF BAND -->
            <tr>
              <td style="background:#C9A84C;padding:12px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  Booking Reference: ${refId}
                </p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:35px 40px;">
                <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">
                  Dear <strong>${name}</strong>,<br><br>
                  ${isHallBk
                    ? `Your venue check-in is confirmed for today. We trust everything is in order for your event.`
                    : `You have successfully checked in at <strong>Royal Palace Resort</strong>. We hope you have a wonderful and memorable stay.`
                  }
                </p>

                <!-- STAY / EVENT DETAILS -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">
                      ${isHallBk ? "🏛 Venue Details" : "🛏 Stay Details"}
                    </td>
                  </tr>
                  ${stayBlock}
                </table>

                <!-- PAYMENT BLOCK -->
                ${paymentBlock}

                <!-- WIFI / FACILITIES NOTE -->
                ${!isHallBk ? `
                <div style="background:#fdf8ee;border-left:4px solid #C9A84C;padding:15px 20px;border-radius:0 8px 8px 0;margin-bottom:25px;">
                  <p style="margin:0 0 8px;color:#8B6914;font-size:13px;font-weight:700;">🏨 During Your Stay</p>
                  <ul style="margin:0;padding-left:18px;color:#666;font-size:13px;line-height:1.9;">
                    <li>Wi-Fi password: <strong>RPR${refId}@2024</strong> (available at front desk)</li>
                    <li>Room service available 24/7 — Dial <strong>0</strong> from your room phone.</li>
                    <li>Check-out time is <strong>8:00 AM</strong> — request late check-out at the front desk.</li>
                    ${amountDeferredToCheckout > 0 ? `<li>Balance of <strong>₹${fmt(amountDeferredToCheckout)}</strong> is due at checkout.</li>` : ""}
                    <li>For any assistance, please contact the front desk at any time.</li>
                  </ul>
                </div>
                ` : `
                <div style="background:#fdf8ee;border-left:4px solid #C9A84C;padding:15px 20px;border-radius:0 8px 8px 0;margin-bottom:25px;">
                  <p style="margin:0 0 8px;color:#8B6914;font-size:13px;font-weight:700;">📋 Event Day Reminders</p>
                  <ul style="margin:0;padding-left:18px;color:#666;font-size:13px;line-height:1.9;">
                    <li>Hall access hours: <strong>8:00 AM to 10:00 PM</strong>.</li>
                    <li>All external vendors must report to reception for entry.</li>
                    ${amountDeferredToCheckout > 0 ? `<li>Balance of <strong>₹${fmt(amountDeferredToCheckout)}</strong> is due today at the front desk.</li>` : ""}
                    <li>For any assistance, contact our events team at the front desk.</li>
                  </ul>
                </div>
                `}

                <p style="color:#333;font-size:14px;line-height:1.7;margin:0 0 25px;">
                  ${isHallBk ? "We wish your event every success. " : "Thank you for staying with us. "}
                  For any assistance, reach us at
                  <a href="mailto:${process.env.EMAIL_USER}" style="color:#C9A84C;text-decoration:none;">${process.env.EMAIL_USER}</a>.
                </p>
                <p style="color:#555;font-size:14px;margin:0;">Warm Regards,<br><strong style="color:#1a1208;">Royal Palace Resort Team</strong></p>
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

    const subject = isHallBk
      ? `Checked In — ${roomType?.type_name} Venue | Ref #${refId}`
      : `Checked In — Welcome to Your Room | Ref #${refId}`;

    await transporter.sendMail({
      from:    `"Royal Palace Resort" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject,
      html,
    });

    console.log("✅ Check-in email sent to:", email);
  } catch (err) {
    console.error("❌ Check-in email error:", err.message);
  }
};

module.exports = sendCheckInEmail;