// backend/utils/sendCheckOutEmail.js

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
  sendCheckOutEmail({
    booking,           // populated booking doc
    customer,          // customer doc
    roomType,          // roomType doc
    isHallBk,          // bool
    amountCollected,   // number — collected at checkout (0 if was already fully paid)
    paymentMethod,     // string | null
    upiId,             // string | null
    cardNumber,        // last-4 string | null
    isEarlyCheckout,   // bool
    earlyCheckoutDetails: { stayedNights, unusedNights, totalDeduction, refundAmount }
    siteUrl,           // e.g. "https://royalpalaceresort.com"
  })
*/
const sendCheckOutEmail = async ({
  booking,
  customer,
  roomType,
  isHallBk             = false,
  amountCollected      = 0,
  paymentMethod        = null,
  upiId                = null,
  cardNumber           = null,
  isEarlyCheckout      = false,
  earlyCheckoutDetails = null,
  siteUrl              = process.env.SITE_URL || "http://localhost:5173",
}) => {
  try {
    const name     = customer?.name  || "Valued Guest";
    const email    = customer?.email;
    if (!email) return;

    const refId    = booking._id?.toString().slice(-8).toUpperCase();
    const totalPaid = Number(booking.totalAmount) || 0;

    /* payment method display */
    let methodStr = paymentMethod ? (METHOD_LABEL[paymentMethod] || paymentMethod) : null;
    if (paymentMethod === "upi" && upiId)
      methodStr += ` — <strong>${upiId}</strong>`;
    if ((paymentMethod === "credit_card" || paymentMethod === "debit_card") && cardNumber)
      methodStr += ` ending in <strong>****${cardNumber}</strong>`;

    /* receipt rows */
    const receiptRows = [
      booking.paymentDetails?.method && {
        label: "At Booking",
        method: METHOD_LABEL[booking.paymentDetails.method] || booking.paymentDetails.method,
        amount: Number(booking.amountPaid) - (booking.checkInPayment?.amount || 0) - (booking.checkOutPayment?.amount || 0),
      },
      booking.checkInPayment?.amount > 0 && {
        label: "At Check-In",
        method: METHOD_LABEL[booking.checkInPayment.method] || booking.checkInPayment.method,
        amount: booking.checkInPayment.amount,
      },
      amountCollected > 0 && {
        label: "At Check-Out",
        method: methodStr || "—",
        amount: amountCollected,
      },
    ].filter(Boolean);

    const receiptTable = receiptRows.map((row, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9f5ee" : "#ffffff"};">
        <td style="padding:10px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">${row.label}</td>
        <td style="padding:10px 16px;color:#444;font-size:13px;border-bottom:1px solid #f0ebe2;">${row.method}</td>
        <td style="padding:10px 16px;color:#2e7d32;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">₹${fmt(row.amount)}</td>
      </tr>
    `).join("");

    /* early checkout block */
    const earlyBlock = isEarlyCheckout && earlyCheckoutDetails ? `
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0 0 10px;color:#92400e;font-size:13px;font-weight:700;">⚡ Early Checkout Applied</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#666;font-size:12px;padding:3px 0;">Nights Stayed</td>
            <td style="color:#222;font-size:12px;font-weight:600;text-align:right;">${earlyCheckoutDetails.stayedNights} night${earlyCheckoutDetails.stayedNights !== 1 ? "s" : ""}</td>
          </tr>
          <tr>
            <td style="color:#666;font-size:12px;padding:3px 0;">Unused Nights</td>
            <td style="color:#222;font-size:12px;font-weight:600;text-align:right;">${earlyCheckoutDetails.unusedNights} night${earlyCheckoutDetails.unusedNights !== 1 ? "s" : ""}</td>
          </tr>
          <tr>
            <td style="color:#666;font-size:12px;padding:3px 0;">Early Checkout Fee (10%/night)</td>
            <td style="color:#d97706;font-size:12px;font-weight:700;text-align:right;">₹${fmt(earlyCheckoutDetails.totalDeduction)}</td>
          </tr>
          ${earlyCheckoutDetails.refundAmount > 0 ? `
          <tr style="border-top:1px solid #fde68a;">
            <td style="color:#666;font-size:12px;padding:6px 0 3px;">Refund to Guest</td>
            <td style="color:#2e7d32;font-size:13px;font-weight:700;text-align:right;padding:6px 0 3px;">₹${fmt(earlyCheckoutDetails.refundAmount)}</td>
          </tr>
          ` : ""}
        </table>
      </div>
    ` : "";

    /* feedback CTA */
    const feedbackUrl = `${siteUrl}/my-bookings`;
    const feedbackBlock = !isHallBk ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border-radius:10px;overflow:hidden;border:1px solid #e8e0d0;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1208,#2d2010);padding:24px 30px;text-align:center;">
            <p style="margin:0 0 4px;font-size:22px;">⭐</p>
            <p style="margin:0 0 8px;color:#f5edd8;font-size:15px;font-weight:700;font-family:Georgia,serif;">How was your stay?</p>
            <p style="margin:0 0 18px;color:#C9A84C;font-size:13px;line-height:1.6;">
              Your feedback helps us serve every guest better.<br>
              It takes less than a minute — and means the world to us.
            </p>
            <a href="${feedbackUrl}" target="_blank"
              style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#ddb94e);color:#1a1208;font-weight:800;
                font-size:13px;padding:12px 30px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
              ✦ Rate Your Experience
            </a>
            <p style="margin:14px 0 0;color:#6b5c3e;font-size:11px;">
              Visit My Bookings → find this booking → click Details → Rate Your Stay
            </p>
          </td>
        </tr>
      </table>
    ` : "";

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
                  ${isHallBk ? "Event Completed" : "Thank You for Staying With Us"}
                </h1>
                <p style="margin:10px 0 0;color:#C9A84C;font-size:14px;">
                  ✦ &nbsp;${isHallBk ? "Your event is complete" : "We hope to see you again soon"}&nbsp; ✦
                </p>
              </td>
            </tr>

            <!-- REF BAND -->
            <tr>
              <td style="background:#C9A84C;padding:12px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  Booking Reference: ${refId} &nbsp;|&nbsp; Checked Out: ${fmtDate(new Date())}
                </p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:35px 40px;">
                <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">
                  Dear <strong>${name}</strong>,<br><br>
                  ${isHallBk
                    ? `Thank you for choosing <strong>Royal Palace Resort</strong> for your event. Your check-out has been processed and your booking is now complete.`
                    : `Your check-out from <strong>Royal Palace Resort</strong> has been processed. We truly enjoyed hosting you and hope your stay exceeded expectations.`
                  }
                </p>

                <!-- STAY SUMMARY -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">
                      ${isHallBk ? "🏛 Event Summary" : "🛏 Stay Summary"}
                    </td>
                  </tr>
                  ${isHallBk ? `
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;width:45%;border-bottom:1px solid #f0ebe2;">Venue</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${roomType?.type_name || "—"}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;">Event Date</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">${fmtDate(booking.checkInDateTime)}</td>
                  </tr>
                  ` : `
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;width:45%;border-bottom:1px solid #f0ebe2;">Room Type</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${roomType?.type_name || "—"}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Room Number</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">
                      Room ${booking.room?.room_number || "—"} &nbsp;•&nbsp; Floor ${booking.room?.floor || "—"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-In Date</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${fmtDate(booking.checkInDateTime)}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-Out Date</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${fmtDate(new Date())}</td>
                  </tr>
                  `}
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;">Total Amount Paid</td>
                    <td style="padding:12px 16px;color:#2e7d32;font-size:14px;font-weight:700;">₹${fmt(totalPaid)}</td>
                  </tr>
                </table>

                <!-- EARLY CHECKOUT BLOCK (if applicable) -->
                ${earlyBlock}

                <!-- PAYMENT RECEIPT TABLE -->
                ${receiptRows.length > 0 ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="3" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">💰 Full Payment Receipt</td>
                  </tr>
                  <tr style="background:#f0ebe2;">
                    <th style="padding:8px 16px;text-align:left;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #e8e0d0;">Stage</th>
                    <th style="padding:8px 16px;text-align:left;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #e8e0d0;">Method</th>
                    <th style="padding:8px 16px;text-align:left;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #e8e0d0;">Amount</th>
                  </tr>
                  ${receiptTable}
                  <tr style="background:#e8f5e9;">
                    <td colspan="2" style="padding:12px 16px;color:#2e7d32;font-size:13px;font-weight:700;">Total Paid</td>
                    <td style="padding:12px 16px;color:#2e7d32;font-size:14px;font-weight:800;">₹${fmt(totalPaid)}</td>
                  </tr>
                </table>
                ` : ""}

                <!-- FEEDBACK CTA (rooms only) -->
                ${feedbackBlock}

                <!-- VISIT AGAIN CTA -->
                <div style="background:linear-gradient(135deg,#fdf8ee,#f5edd8);border:1px solid #e8d5a3;border-radius:10px;padding:22px 24px;margin-bottom:25px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:18px;">🏨</p>
                  <p style="margin:0 0 8px;color:#8B6914;font-size:14px;font-weight:700;font-family:Georgia,serif;">Come Back Soon</p>
                  <p style="margin:0 0 14px;color:#666;font-size:13px;line-height:1.6;">
                    We'd love to welcome you again. Book your next stay and enjoy our finest hospitality.
                  </p>
                  <a href="${siteUrl}/rooms" target="_blank"
                    style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#ddb94e);color:#1a1208;font-weight:800;
                      font-size:12px;padding:10px 24px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                    Book Your Next Visit →
                  </a>
                </div>

                <p style="color:#333;font-size:14px;line-height:1.7;margin:0 0 25px;">
                  Thank you once again for choosing <strong>Royal Palace Resort</strong>.
                  For any queries, reach us at
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
      ? `Event Check-Out Complete — ${roomType?.type_name} | Ref #${refId}`
      : `Checked Out — Thank You for Staying | Ref #${refId}`;

    await transporter.sendMail({
      from:    `"Royal Palace Resort" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject,
      html,
    });

    console.log("✅ Check-out email sent to:", email);
  } catch (err) {
    console.error("❌ Check-out email error:", err.message);
  }
};

module.exports = sendCheckOutEmail;