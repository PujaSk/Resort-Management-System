// backend/utils/sendPasswordChangedEmail.js

const { sendEmail } = require("./mailer");

const sendPasswordChangedEmail = async (email, name = "User", type = "changed") => {
  const actionLabel = type === "reset" ? "reset via OTP" : "changed";
  const timeStr = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "2-digit", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const html = `
  <div style="margin:0;padding:0;font-family:Arial,sans-serif;background:#0D0B08;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#13110E;border-radius:14px;overflow:hidden;border:1px solid rgba(201,168,76,.15);">
        <tr><td style="height:3px;background:linear-gradient(90deg,#C9A84C,#E0C06A,#C9A84C);"></td></tr>
        <tr><td style="padding:32px 36px 20px;border-bottom:1px solid rgba(255,255,255,.06);">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><p style="margin:0;font-size:20px;font-weight:800;color:#C9A84C;">Royal Palace Resort</p><p style="margin:4px 0 0;font-size:11px;color:#6B6054;text-transform:uppercase;letter-spacing:0.15em;">Security Alert</p></td>
            <td align="right"><div style="width:42px;height:42px;border-radius:10px;background:rgba(224,82,82,.12);border:1px solid rgba(224,82,82,.25);text-align:center;line-height:42px;font-size:20px;">🔒</div></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:28px 36px;">
          <p style="margin:0 0 12px;font-size:14px;color:#8A7E6A;">Hello, <strong style="color:#F5ECD7;">${name}</strong></p>
          <p style="margin:0 0 20px;font-size:14px;color:#8A7E6A;line-height:1.7;">Your account password was successfully <strong style="color:#F5ECD7;">${actionLabel}</strong> on your Royal Palace Resort account.</p>
          <div style="padding:16px 20px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);margin-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-size:11px;color:#6B6054;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:4px;">Account</td><td align="right" style="font-size:13px;font-weight:600;color:#F5ECD7;">${email}</td></tr>
              <tr><td style="font-size:11px;color:#6B6054;text-transform:uppercase;letter-spacing:0.1em;padding-top:10px;">Time (IST)</td><td align="right" style="font-size:13px;font-weight:600;color:#C9A84C;padding-top:10px;">${timeStr}</td></tr>
              <tr><td style="font-size:11px;color:#6B6054;text-transform:uppercase;letter-spacing:0.1em;padding-top:10px;">Method</td><td align="right" style="font-size:13px;font-weight:600;color:#C8BAA0;padding-top:10px;">${type==="reset"?"OTP Verification":"Current Password"}</td></tr>
            </table>
          </div>
          <div style="padding:14px 18px;border-radius:10px;background:rgba(224,82,82,.07);border:1px solid rgba(224,82,82,.2);margin-bottom:20px;">
            <p style="margin:0;font-size:13px;color:#E05252;font-weight:600;">⚠ Not you?</p>
            <p style="margin:6px 0 0;font-size:12px;color:#8A7E6A;line-height:1.6;">If you did not make this change, please contact your system administrator immediately.</p>
          </div>
          <p style="margin:0;font-size:13px;color:#6B6054;line-height:1.7;">If this was you, no action is needed. Your account is secure.</p>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,.05);text-align:center;">
          <p style="margin:0;font-size:11px;color:#4A4035;">© ${new Date().getFullYear()} Royal Palace Resort · Automated security notification</p>
        </td></tr>
      </table>
    </td></tr></table>
  </div>`;

  await sendEmail(email, `🔒 Password ${type === "reset" ? "Reset" : "Changed"} — Royal Palace Resort`, html);
  console.log(`✅ Password-changed email sent to ${email}`);
};

module.exports = sendPasswordChangedEmail;