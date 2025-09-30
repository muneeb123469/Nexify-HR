const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createSampleUser() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'john.doe@example.com' });
    
    if (existingUser) {
      console.log('Sample user already exists:', existingUser.email);
      process.exit(0);
    }

    // Create sample user
    const sampleUser = new User({
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123', // In real app, this would be hashed
      role: 'applicant'
    });

    await sampleUser.save();
    console.log('Sample user created successfully:', sampleUser.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample user:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  createSampleUser();
}

module.exports = { createSampleUser };