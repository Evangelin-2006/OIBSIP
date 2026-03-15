const nodemailer = require("nodemailer");

/*
=====================================
GMAIL TRANSPORTER WITH POOLING
(prevents authentication issues)
=====================================
*/

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


/*
=====================================
VERIFY ONLY ON SERVER START
=====================================
*/
async function verifyEmailServer() {
  try {
    await transporter.verify();
    console.log("[SUCCESS] Email server ready");
  } catch (err) {
    console.error("[ERROR] Email config failed:", err.message);
  }
}


/*
=====================================
SEND LOW STOCK MAIL (Single Item)
=====================================
*/
async function sendLowStockMail(item) {
  if (!item) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || "admin@pizzadelivery.com",
      subject: "[ALERT] Low Stock Alert - Pizza Delivery",
      html: `
        <h2>Low Stock Alert</h2>
        <p><strong>${item.name}</strong> stock is running low!</p>
        <p>Current Stock: <span style="color: red; font-weight: bold;">${item.stock}</span> units</p>
        <p>Threshold: 20 units</p>
        <p>Please restock immediately.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    });

    console.log(`[EMAIL] Low stock email sent for ${item.name}`);
  } catch (err) {
    console.error(`[ERROR] Mail send failed for ${item.name}:`, err.message);
  }
}


/*
=====================================
SEND LOW STOCK ALERT (Batch)
=====================================
*/
async function sendLowStockAlert(adminEmail, items) {
  if (!items || items.length === 0) return;

  try {
    const itemsList = items
      .map(item => `• ${item.category}: ${item.name} (${item.stock}/${item.threshold} units)`)
      .join("<br>");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail || process.env.ADMIN_EMAIL || "admin@pizzadelivery.com",
      subject: `[ALERT] Multiple Low Stock Items Alert - ${items.length} Items`,
      html: `
        <h2>Low Stock Alert</h2>
        <p>The following items are below the threshold of 20 units:</p>
        <ul style="font-size: 14px;">
          ${itemsList}
        </ul>
        <p><strong>Action Required:</strong> Please restock these items immediately.</p>
        <p style="color: #666; font-size: 12px;">Alert Time: ${new Date().toLocaleString()}</p>
      `
    });

    console.log(`[EMAIL] Batch low stock email sent to ${adminEmail}`);
  } catch (err) {
    console.error(`[ERROR] Batch email failed:`, err.message);
    console.log(`[INFO] LOW STOCK ALERT - Items affected: ${items.length}`);
    items.forEach(item => {
      console.log(`  • ${item.category}: ${item.name} (${item.stock} units)`);
    });
  }
}

/*
=====================================
SEND VERIFICATION EMAIL
=====================================
*/
async function sendVerificationEmail(to, verificationLink) {
  console.log(`[EMAIL] Attempting to send verification email to: ${to}`);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Verify Your Pizza Delivery Account",
      html: `
        <h2>Welcome to Pizza Delivery!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="background-color: #ff6b35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    });

    console.log(`[EMAIL] Verification email sent to ${to}`);
    console.log(`[TEST] Verification link: ${verificationLink}`);
  } catch (err) {
    console.error(`[ERROR] Verification email failed for ${to}:`, err.message);
  }
}




// ---------------- Reset Password Email ----------------
const sendResetPasswordEmail = async (email, link) => {
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <h3>Password Reset</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 15 minutes.</p>
    `
  });

  console.log("[EMAIL] Reset email sent to", email);
};
module.exports = {
  transporter,
  verifyEmailServer,
  sendLowStockMail,
  sendLowStockAlert,
  sendVerificationEmail,
  sendResetPasswordEmail
};