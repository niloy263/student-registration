// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Student = require('../models/studentModel');
const JWT_SECRET = 'your_jwt_secret';

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.student = await Student.findById(decoded.id);
    next();
  } catch (error) {
    res.status(500).json({ message: 'Not authorized' });
  }
};
