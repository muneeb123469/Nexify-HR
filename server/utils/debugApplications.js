const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/User');
require('dotenv').config();

async function debugApplications() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all applications
    const applications = await Application.find({}).populate('job', 'title company');
    console.log(`\nFound ${applications.length} applications in database:`);
    
    applications.forEach((app, index) => {
      console.log(`\n${index + 1}. Application ID: ${app._id}`);
      console.log(`   Email: ${app.email}`);
      console.log(`   Name: ${app.name}`);
      console.log(`   Job: ${app.job?.title || 'N/A'} at ${app.job?.company || 'N/A'}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Created: ${app.createdAt}`);
    });

    // Get all users
    const users = await User.find({});
    console.log(`\n\nFound ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user._id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    });

    // Check for email matches
    console.log('\n\nChecking email matches between users and applications:');
    for (const user of users) {
      const userApplications = applications.filter(app => app.email === user.email);
      console.log(`\nUser ${user.email} has ${userApplications.length} applications`);
      if (userApplications.length > 0) {
        userApplications.forEach(app => {
          console.log(`  - ${app.job?.title || 'Unknown Job'} (${app.status})`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error debugging applications:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  debugApplications();
}

module.exports = { debugApplications };