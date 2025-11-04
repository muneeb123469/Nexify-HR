const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Log requests to uploads
app.use('/uploads', (req, res, next) => {
  console.log(`Serving file: ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/jobs', require('./Routes/jobRoutes'));
app.use('/api/applications', require('./Routes/applicationRoutes'));
app.use('/api/admin', require('./Routes/adminRoutes'));
app.use('/api/interviews', require('./Routes/interviewRoutes'));
app.use('/api/meetings', require('./Routes/meetingRoutes'));
app.use('/api/users', require('./Routes/userRoutes'));
app.use('/api', require('./Routes/employeeRoutes'));
app.use('/api', require('./Routes/attendanceRoutes'));
app.use('/api/leave', require('./Routes/leaveRoutes'));
app.use('/api/locations', require('./Routes/locationRoutes'));
app.use('/api/tasks', require('./Routes/taskRoutes'));
app.use('/api/reports', require('./Routes/reportRoutes'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    // Start server only after successful database connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Uploads directory: ${uploadsDir}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1); // Exit process with failure
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
