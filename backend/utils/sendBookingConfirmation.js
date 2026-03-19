// backend/utils/sendBookingConfirmation.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const fmt     = (n) => Number(n).toLocaleString("en-IN");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
});

const fmtYMD = (ymd) => {
  const [y, mo, d] = ymd.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "long", year: "numeric"
  });
};

const paymentMethodLabel = (method) => ({
  credit_card: "Credit Card",
  debit_card:  "Debit Card",
  upi:         "UPI",
  checkin:     "Pay at Check-In",
})[method] || method;

/* ══════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════ */
const sendBookingConfirmation = async ({
  booking, customer, roomType, room,
  isHall    = false,
  hallDates = [],
}) => {
  try {
    const payDetails = booking.paymentDetails || {};

    /* ── Payment method string ── */
    let paymentInfo = `<strong>${paymentMethodLabel(payDetails.method || "—")}</strong>`;
    if (payDetails.method === "credit_card" || payDetails.method === "debit_card") {
      if (payDetails.cardNumber) paymentInfo += ` ending in <strong>****${payDetails.cardNumber}</strong>`;
      if (payDetails.cardName)   paymentInfo += ` (${payDetails.cardName})`;
    }
    if (payDetails.method === "upi" && payDetails.upiId) {
      paymentInfo += ` — <strong>${payDetails.upiId}</strong>`;
    }

    /* ── Split label ── */
    const splitChoice  = payDetails.splitChoice || booking.paymentSplit || "full";
    const isHalfPay    = splitChoice === "half";
    const splitLabel   = isHalfPay ? "50% Upfront" : "Full Payment";
    const splitColor   = isHalfPay ? "#f59e0b" : "#2e7d32";
    const splitBg      = isHalfPay ? "#fef3c7"  : "#e8f5e9";

    const totalAmount  = Number(booking.totalAmount)  || 0;
    const amountPaid   = Number(booking.amountPaid)   || 0;
    const amountDue    = Number(booking.amountDue)    || 0;

    /* ══════════════════════════════════════════
       HALL EMAIL
    ══════════════════════════════════════════ */
    if (isHall && hallDates.length) {
      const sorted      = [...hallDates].sort();
      const daysBooked  = sorted.length;
      const pricePerDay = roomType?.price_per_night || 0;
      const totalAmt    = daysBooked * pricePerDay;

      /* payment split for halls */
      const hallSplitChoice = payDetails.splitChoice || booking.paymentSplit || "full";
      const hallIsHalfPay   = hallSplitChoice === "half";
      const hallPaidPerDay  = hallIsHalfPay ? Math.ceil(pricePerDay / 2) : pricePerDay;
      const hallPaidTotal   = hallPaidPerDay * daysBooked;
      const hallDuePerDay   = pricePerDay - hallPaidPerDay;
      const hallDueTotal    = hallDuePerDay * daysBooked;
      const hallCancFee     = Math.round(pricePerDay * 0.25);
      const hallSplitLabel  = hallIsHalfPay ? "50% Upfront" : "Full Payment";
      const hallSplitColor  = hallIsHalfPay ? "#f59e0b" : "#2e7d32";
      const hallSplitBg     = hallIsHalfPay ? "#fef3c7"  : "#e8f5e9";

      const dateRows = sorted.map((ymd, i) => `
        <tr style="background:${i % 2 === 0 ? "#f9f5ee" : "#ffffff"}">
          <td style="padding:10px 16px; color:#888; font-size:13px;">${i + 1}</td>
          <td style="padding:10px 16px; color:#222; font-size:13px; font-weight:600;">${fmtYMD(ymd)}</td>
        </tr>
      `).join("");

      const html = `
      <div style="margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#f4f1eb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr><td align="center">
            <table width="620" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.12);">

              <tr>
                <td style="background:linear-gradient(135deg,#1a1208 0%,#2d2010 50%,#1a1208 100%);padding:40px 40px 30px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;">Royal Palace Resort</p>
                  <h1 style="margin:0;font-size:28px;color:#f5edd8;font-weight:700;letter-spacing:1px;">Venue Booking Confirmed</h1>
                  <p style="margin:10px 0 0;color:#C9A84C;font-size:14px;">✦ &nbsp;Your hall is reserved&nbsp; ✦</p>
                </td>
              </tr>

              <tr>
                <td style="background:#C9A84C;padding:12px 40px;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                    Booking Reference: ${booking._id?.toString().slice(-8).toUpperCase()}
                  </p>
                </td>
              </tr>

              ${hallIsHalfPay ? `
              <tr>
                <td style="background:#fef3c7;padding:12px 40px;text-align:center;border-bottom:1px solid #fde68a;">
                  <p style="margin:0;font-size:12px;color:#92400e;font-weight:700;">
                    ⚡ 50% Paid Now · ₹${fmt(hallDueTotal)} due on first event date
                  </p>
                </td>
              </tr>
              ` : ""}

              <tr>
                <td style="padding:35px 40px;">
                  <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">
                    Dear <strong>${customer?.name || "Valued Guest"}</strong>,<br><br>
                    Thank you for choosing <strong>Royal Palace Resort</strong> for your event.
                    Your hall reservation is confirmed. Please find the full details below.
                  </p>

                  <!-- VENUE DETAILS -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                    <tr>
                      <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">🏛 Venue Details</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;color:#888;font-size:13px;width:40%;border-bottom:1px solid #f0ebe2;">Hall / Venue</td>
                      <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${roomType?.type_name || "—"}</td>
                    </tr>
                    <tr style="background:#fdfaf5;">
                      <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Total Days Booked</td>
                      <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${daysBooked} Day${daysBooked !== 1 ? "s" : ""}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;color:#888;font-size:13px;">Capacity</td>
                      <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">Up to ${roomType?.capacity || "—"} guests</td>
                    </tr>
                  </table>

                  <!-- BOOKED DATES -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                    <tr>
                      <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">📅 Reserved Dates</td>
                    </tr>
                    <tr style="background:#f0ebe2;">
                      <th style="padding:8px 16px;text-align:left;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #e8e0d0;">#</th>
                      <th style="padding:8px 16px;text-align:left;font-size:11px;color:#888;font-weight:600;border-bottom:1px solid #e8e0d0;">Date</th>
                    </tr>
                    ${dateRows}
                  </table>

                  <!-- PAYMENT SUMMARY -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                    <tr>
                      <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">💰 Payment Summary</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Rate</td>
                      <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:600;border-bottom:1px solid #f0ebe2;">₹${fmt(pricePerDay)} × ${daysBooked} day${daysBooked !== 1 ? "s" : ""}</td>
                    </tr>
                    <tr style="background:#fdfaf5;">
                      <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Total Amount</td>
                      <td style="padding:12px 16px;color:#222;font-size:14px;font-weight:700;border-bottom:1px solid #f0ebe2;">₹${fmt(totalAmt)}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Payment Plan</td>
                      <td style="padding:12px 16px;border-bottom:1px solid #f0ebe2;">
                        <span style="background:${hallSplitBg};color:${hallSplitColor};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${hallSplitLabel}</span>
                      </td>
                    </tr>
                    <tr style="background:#fdfaf5;">
                      <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Paid Now</td>
                      <td style="padding:12px 16px;color:#2e7d32;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">₹${fmt(hallPaidTotal)}</td>
                    </tr>
                    ${hallIsHalfPay ? `
                    <tr>
                      <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Due on First Event Date</td>
                      <td style="padding:12px 16px;color:#d97706;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">₹${fmt(hallDueTotal)}</td>
                    </tr>
                    ` : ""}
                    <tr style="background:#fdfaf5;">
                      <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Payment Method</td>
                      <td style="padding:12px 16px;color:#222;font-size:13px;border-bottom:1px solid #f0ebe2;">${paymentInfo}</td>
                    </tr>
                    <tr>
                      <td style="padding:12px 16px;color:#888;font-size:13px;">Payment Status</td>
                      <td style="padding:12px 16px;">
                        <span style="background:${hallIsHalfPay ? "#fef3c7" : "#e8f5e9"};color:${hallIsHalfPay ? "#92400e" : "#2e7d32"};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">
                          ${hallIsHalfPay ? "Partially Paid" : "Paid"}
                        </span>
                      </td>
                    </tr>
                  </table>

                  <div style="background:#fdf8ee;border-left:4px solid #C9A84C;padding:15px 20px;border-radius:0 8px 8px 0;margin-bottom:25px;">
                    <p style="margin:0 0 8px;color:#8B6914;font-size:13px;font-weight:700;">📋 Important Notes</p>
                    <ul style="margin:0;padding-left:18px;color:#666;font-size:13px;line-height:1.8;">
                      <li>Please carry a valid government-issued photo ID when visiting.</li>
                      <li>Hall access begins at 8:00 AM and must be vacated by 10:00 PM on each booked day.</li>
                      <li>For any changes or special arrangements, contact us at least 48 hours prior.</li>
                      <li>Decorations, catering, and external vendors require prior approval from management.</li>
                      ${hallIsHalfPay ? `<li>Balance of <strong>₹${fmt(hallDueTotal)}</strong> is payable on the first event date.</li>` : ""}
                      <li>Cancellation policy: <strong>25% cancellation charge per day</strong> (₹${fmt(hallCancFee)}/day) applies on the full per-day rate — regardless of how much was paid upfront. ${hallIsHalfPay ? "If cancelled, remaining balance will be waived." : ""}</li>
                    </ul>
                  </div>

                  <p style="color:#333;font-size:14px;line-height:1.7;margin:0 0 25px;">
                    We look forward to hosting your event. For any queries, please reach us at
                    <a href="mailto:${process.env.EMAIL_USER}" style="color:#C9A84C;text-decoration:none;">${process.env.EMAIL_USER}</a>.
                  </p>
                  <p style="color:#555;font-size:14px;margin:0;">Warm Regards,<br><strong style="color:#1a1208;">Royal Palace Resort Team</strong></p>
                </td>
              </tr>

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
        to:      customer?.email,
        subject: hallIsHalfPay
          ? `Hall Booking Confirmed (50% Paid) — ${roomType?.type_name} | ${daysBooked} Day${daysBooked !== 1 ? "s" : ""}`
          : `Hall Booking Confirmed — ${roomType?.type_name} | ${daysBooked} Day${daysBooked !== 1 ? "s" : ""}`,
        html,
      });
      console.log("✅ Hall booking confirmation sent to:", customer?.email);
      return;
    }

    /* ══════════════════════════════════════════
       ROOM BOOKING EMAIL
       Shows split payment info clearly:
       - "50% Upfront" or "Full Payment"
       - Amount paid now  vs  amount due at check-in
       - Cancellation policy: 15% of total
    ══════════════════════════════════════════ */
    const nights = Math.round(
      (new Date(booking.checkOutDateTime) - new Date(booking.checkInDateTime)) / 86400000
    );

    const guestRows = (booking.guests || []).map((g, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"}">
        <td style="padding:8px 12px; color:#555;">${i + 1}</td>
        <td style="padding:8px 12px; color:#333; font-weight:600;">${g.name}</td>
        <td style="padding:8px 12px; color:#555;">${g.age}</td>
        <td style="padding:8px 12px; color:#555;">${g.gender}</td>
      </tr>
    `).join("");

    const cancFee = Math.round(totalAmount * 0.15);

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
                <h1 style="margin:0;font-size:28px;color:#f5edd8;font-weight:700;letter-spacing:1px;">Booking Confirmed</h1>
                <p style="margin:10px 0 0;color:#C9A84C;font-size:14px;">✦ Your reservation is secured ✦</p>
              </td>
            </tr>

            <tr>
              <td style="background:#C9A84C;padding:12px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#1a1208;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  Booking Reference: ${booking._id?.toString().slice(-8).toUpperCase()}
                </p>
              </td>
            </tr>

            <!-- PAYMENT SPLIT BANNER — shown for 50% payments -->
            ${isHalfPay ? `
            <tr>
              <td style="background:#fef3c7;padding:12px 40px;text-align:center;border-bottom:1px solid #fde68a;">
                <p style="margin:0;font-size:12px;color:#92400e;font-weight:700;">
                  ⚡ 50% Paid Now · ₹${fmt(amountDue)} due at check-in
                </p>
              </td>
            </tr>
            ` : ""}

            <tr>
              <td style="padding:35px 40px;">
                <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 25px;">
                  Dear <strong>${customer?.name || "Valued Guest"}</strong>,<br><br>
                  Thank you for choosing <strong>Royal Palace Resort</strong>.
                  We are delighted to confirm your reservation. Below are the complete details.
                </p>

                <!-- STAY DETAILS -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">🛏 Stay Details</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;width:40%;border-bottom:1px solid #f0ebe2;">Room Type</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${roomType?.type_name || "—"}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Room Number</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">
                      Room ${room?.room_number || "—"} &nbsp;•&nbsp; Floor ${room?.floor || "—"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-In</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">
                      ${fmtDate(booking.checkInDateTime)} <span style="color:#888;font-weight:400;">(from 9:00 AM)</span>
                    </td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Check-Out</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">
                      ${fmtDate(booking.checkOutDateTime)} <span style="color:#888;font-weight:400;">(by 8:00 AM)</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Duration</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">${nights} Night${nights !== 1 ? "s" : ""}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;">Guests</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:700;">
                      ${booking.adults} Adult${booking.adults !== 1 ? "s" : ""}
                      ${booking.children > 0 ? `, ${booking.children} Child${booking.children !== 1 ? "ren" : ""}` : ""}
                    </td>
                  </tr>
                </table>

                <!-- GUEST LIST -->
                ${guestRows ? `
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="4" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">👥 Guest Information</td>
                  </tr>
                  <tr style="background:#f0ebe2;">
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;">#</th>
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;">Name</th>
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;">Age</th>
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;">Gender</th>
                  </tr>
                  ${guestRows}
                </table>` : ""}

                <!-- PAYMENT SUMMARY -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
                  <tr>
                    <td colspan="2" style="background:#f9f5ee;padding:12px 16px;font-size:12px;letter-spacing:2px;color:#8B6914;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e8e0d0;">💰 Payment Summary</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Room Rate</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;font-weight:600;border-bottom:1px solid #f0ebe2;">₹${fmt(roomType?.price_per_night)} × ${nights} night${nights !== 1 ? "s" : ""}</td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Total Amount</td>
                    <td style="padding:12px 16px;color:#222;font-size:14px;font-weight:700;border-bottom:1px solid #f0ebe2;">₹${fmt(totalAmount)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Payment Plan</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0ebe2;">
                      <span style="background:${splitBg};color:${splitColor};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${splitLabel}</span>
                    </td>
                  </tr>
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Paid Now</td>
                    <td style="padding:12px 16px;color:#2e7d32;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">₹${fmt(amountPaid)}</td>
                  </tr>
                  ${amountDue > 0 ? `
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Due at Check-In</td>
                    <td style="padding:12px 16px;color:#d97706;font-size:13px;font-weight:700;border-bottom:1px solid #f0ebe2;">₹${fmt(amountDue)}</td>
                  </tr>
                  ` : ""}
                  <tr style="background:#fdfaf5;">
                    <td style="padding:12px 16px;color:#888;font-size:13px;border-bottom:1px solid #f0ebe2;">Payment Method</td>
                    <td style="padding:12px 16px;color:#222;font-size:13px;border-bottom:1px solid #f0ebe2;">${paymentInfo}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px;color:#888;font-size:13px;">Payment Status</td>
                    <td style="padding:12px 16px;">
                      <span style="background:${amountDue === 0 ? "#e8f5e9" : "#fef3c7"};color:${amountDue === 0 ? "#2e7d32" : "#92400e"};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">
                        ${amountDue === 0 ? "Paid" : "Partially Paid"}
                      </span>
                    </td>
                  </tr>
                </table>

                <!-- CANCELLATION POLICY -->
                <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;border-radius:0 8px 8px 0;margin-bottom:25px;">
                  <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:700;">⚠ Cancellation Policy</p>
                  <p style="margin:0;color:#666;font-size:13px;line-height:1.7;">
                    A <strong>15% cancellation fee of ₹${fmt(cancFee)}</strong> applies on the total booking value
                    of ₹${fmt(totalAmount)} if you cancel before check-in — regardless of how much was paid upfront.
                    ${amountDue > 0 ? `If cancelled, the remaining balance of ₹${fmt(amountDue)} due at check-in will be waived. ` : ""}
                    To cancel, visit My Bookings or contact us at
                    <a href="mailto:${process.env.EMAIL_USER}" style="color:#92400e;">${process.env.EMAIL_USER}</a>.
                  </p>
                </div>

                <!-- IMPORTANT NOTES -->
                <div style="background:#fdf8ee;border-left:4px solid #C9A84C;padding:15px 20px;border-radius:0 8px 8px 0;margin-bottom:25px;">
                  <p style="margin:0 0 8px;color:#8B6914;font-size:13px;font-weight:700;">📋 Important Notes</p>
                  <ul style="margin:0;padding-left:18px;color:#666;font-size:13px;line-height:1.8;">
                    <li>Please carry a valid government-issued photo ID at check-in.</li>
                    <li>Check-in time is 9:00 AM and check-out is 8:00 AM.</li>
                    ${amountDue > 0 ? `<li>Balance amount of <strong>₹${fmt(amountDue)}</strong> is payable at the front desk upon arrival.</li>` : ""}
                    <li>For any changes, contact us at least 24 hours prior to check-in.</li>
                  </ul>
                </div>

                <p style="color:#333;font-size:14px;line-height:1.7;margin:0 0 25px;">
                  We look forward to welcoming you. Should you have any questions or special requests,
                  please reach us at
                  <a href="mailto:${process.env.EMAIL_USER}" style="color:#C9A84C;text-decoration:none;">${process.env.EMAIL_USER}</a>.
                </p>
                <p style="color:#555;font-size:14px;margin:0;">Warm Regards,<br><strong style="color:#1a1208;">Royal Palace Resort Team</strong></p>
              </td>
            </tr>

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
      to:      customer?.email,
      subject: isHalfPay
        ? `Booking Confirmed (50% Paid) — ${roomType?.type_name} | ${fmtDate(booking.checkInDateTime)}`
        : `Booking Confirmed — ${roomType?.type_name} | ${fmtDate(booking.checkInDateTime)}`,
      html,
    });

    console.log("✅ Booking confirmation sent to:", customer?.email);

  } catch (err) {
    console.error("❌ Booking email error:", err.message);
  }
};

module.exports = sendBookingConfirmation;