const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password"
  }
});

// Test email connectivity
transporter.verify((err, success) => {
  if (err) {
    console.log("❌ Email service not configured properly:", err.message);
    console.log("⚠️  Low stock alerts will be logged to console instead");
  } else {
    console.log("✅ Email service ready");
  }
});

exports.sendLowStockMail = async (item) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "Pizza Delivery App",
      to: process.env.ADMIN_EMAIL || "admin@pizzadelivery.com",
      subject: "⚠️ Low Stock Alert - Pizza Delivery",
      html: `
        <h2>Low Stock Alert</h2>
        <p><strong>${item.name}</strong> stock is running low!</p>
        <p>Current Stock: <span style="color: red; font-weight: bold;">${item.stock}</span> units</p>
        <p>Threshold: 20 units</p>
        <p>Please restock immediately.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `
    });
    console.log(`📧 Low stock email sent for ${item.name}`);
  } catch (err) {
    console.log(`⚠️ Could not send email for ${item.name}: ${err.message}`);
    console.log(`📦 LOW STOCK ALERT: ${item.name} (${item.stock} units)`);
  }
};

exports.sendLowStockAlert = async (adminEmail, items) => {
  try {
    const itemsList = items
      .map(item => `• ${item.category}: ${item.name} (${item.stock}/${item.threshold} units)`)
      .join("<br>");

    await transporter.sendMail({
      from: process.env.EMAIL_USER || "Pizza Delivery App",
      to: adminEmail || process.env.ADMIN_EMAIL || "admin@pizzadelivery.com",
      subject: `⚠️ Multiple Low Stock Items Alert - ${items.length} Items`,
      html: `
        <h2>🚨 Low Stock Alert</h2>
        <p>The following items are below the threshold of 20 units:</p>
        <ul style="font-size: 14px;">
          ${itemsList}
        </ul>
        <p><strong>Action Required:</strong> Please restock these items immediately.</p>
        <p style="color: #666; font-size: 12px;">Alert Time: ${new Date().toLocaleString()}</p>
      `
    });
    console.log(`📧 Batch low stock email sent to ${adminEmail}`);
  } catch (err) {
    console.log(`⚠️ Could not send batch email: ${err.message}`);
    console.log(`📦 LOW STOCK ALERT - Items affected: ${items.length}`);
    items.forEach(item => {
      console.log(`  • ${item.category}: ${item.name} (${item.stock} units)`);
    });
  }
};
