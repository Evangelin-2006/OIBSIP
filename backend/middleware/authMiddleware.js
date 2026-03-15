const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.adminAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };

    // Check if user is admin
    const User = require("../models/User");
    User.findById(decoded.id).then(user => {
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    }).catch(err => {
      res.status(500).json({ message: "Server error" });
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
