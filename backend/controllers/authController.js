const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { 
  sendVerificationEmail,
  sendResetPasswordEmail 
} = require("../utils/mailer.js");
// ---------------- Registration ----------------
exports.register = async (req, res) => {
    const { name, email, password } = req.body; // remove isAdmin from frontend

    try {
        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if user exists
        if (await User.findOne({ email })) 
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // ⚡ ALWAYS enforce isAdmin: false
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            isAdmin: false, // 👈 key change
            isVerified: false // initially false
        });

        // Generate email verification token
        const verificationToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send verification email
        const verificationLink = `http://localhost:5173/verify/${verificationToken}`;
        await sendVerificationEmail(user.email, verificationLink);

        res.status(201).json({
            message: "Registered successfully. Check your email to verify your account.",
            verificationLink // For testing
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// ---------------- Login ----------------
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        if (!user.isVerified)
            return res.status(400).json({ message: "Email not verified. Please check your email and verify your account." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ---------------- Verify Email ----------------
exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.id, { isVerified: true });
        res.send("Email verified! You can now log in.");
    } catch (err) {
        res.status(400).send("Invalid or expired token");
    }
};
exports.forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    // Send email with reset token
    await sendResetPasswordEmail(user.email, resetLink);

    res.json({ message: "Reset link sent to your email." });

  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
// Reset password controller
exports.resetPasswordController = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      message: "Password reset successfully. You can now log in." 
    });

  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
