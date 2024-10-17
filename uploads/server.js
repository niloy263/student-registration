// server.js
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const studentController = require('./controllers/studentController');
const { protect } = require('./middleware/authMiddleware');
const app = express();

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studentDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.post('/register', studentController.registerStudent);
app.post('/login', studentController.loginStudent);
app.get('/profile', protect, studentController.getStudentProfile);
app.put('/profile', protect, studentController.updateStudentProfile);

// File upload routes
app.post('/upload', protect, studentController.uploadFile, (req, res) => {
  res.json({ message: 'File uploaded', filename: req.file.filename });
});
app.get('/files/:filename', protect, studentController.readFile);
app.delete('/files/:filename', protect, studentController.deleteFile);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
