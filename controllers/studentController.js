// controllers/studentController.js
const Student = require('../models/studentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// JWT secret
const JWT_SECRET = 'your_jwt_secret';

// Register a student
exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const student = new Student({ name, email, password });
    await student.save();
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login student
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ email });

  if (!student) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: student._id }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true }).json({ message: 'Logged in successfully' });
};

// Auth middleware
exports.studentAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.student = await Student.findById(decoded.id);
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student profile
exports.getStudentProfile = async (req, res) => {
  res.status(200).json(req.student);
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  const { name, email } = req.body;
  const student = await Student.findById(req.student._id);

  student.name = name || student.name;
  student.email = email || student.email;
  await student.save();

  res.status(200).json(student);
};

// File Upload using Multer
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.uploadFile = upload.single('profilePicture');
exports.readFile = (req, res) => {
  const filePath = `uploads/${req.params.filename}`;
  res.sendFile(filePath, { root: '.' });
};

exports.deleteFile = (req, res) => {
  const filePath = `uploads/${req.params.filename}`;
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ message: 'File not found' });
    res.status(200).json({ message: 'File deleted successfully' });
  });
};
