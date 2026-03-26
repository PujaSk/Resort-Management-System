// backend/utils/brevoSender.js

const sendEmail = async ({ to, subject, html }) => {
  if (!to) throw new Error("Recipient email (to) is required");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key":      process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name:  process.env.BREVO_SENDER_NAME  || "Royal Palace Resort",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Brevo API error ${response.status}: ${JSON.stringify(err)}`);
  }

  return response.json();
};

module.exports = sendEmail;