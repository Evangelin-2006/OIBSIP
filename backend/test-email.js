require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("[TEST] Testing Email Configuration...\n");
console.log("[EMAIL] EMAIL_USER:", process.env.EMAIL_USER);
console.log("[EMAIL] ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
console.log("[KEY] EMAIL_PASS length:", process.env.EMAIL_PASS?.length || 0);

const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 1,
  maxMessages: 50,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function testEmail() {
  try {
    console.log("\n[INFO] Verifying email connection...");
    await transporter.verify();
    console.log("[SUCCESS] Email authentication successful!");

    console.log("\n[INFO] Sending test email...");
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "[TEST] Test Email - Low Stock Alert System",
      html: `
        <h2>Low Stock Alert Test</h2>
        <p>This is a test email to verify the system is working.</p>
        <p><strong>If you received this, emails are working! [OK]</strong></p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    });

    console.log("[SUCCESS] Email sent successfully!");
    console.log("[EMAIL] Message ID:", result.messageId);
    process.exit(0);

  } catch (err) {
    console.error("[ERROR] Email test failed:");
    console.error("Error:", err.message);
    console.error("\n💡 Possible fixes:");
    console.error("1. Check if Gmail app password is correct");
    console.error("2. Verify 2-Step Verification is enabled on Gmail");
    console.error("3. Make sure EMAIL_USER and EMAIL_PASS are set in .env");
    process.exit(1);
  }
}

testEmail();
