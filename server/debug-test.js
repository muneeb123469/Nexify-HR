// Debug script to test the application endpoint
const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('./models/Job');
const Application = require('./models/Application');

async function debugTest() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if there are any jobs
    const jobs = await Job.find().limit(5);
    console.log(`📋 Found ${jobs.length} jobs in database`);
    
    if (jobs.length > 0) {
      console.log('First job:', {
        id: jobs[0]._id,
        title: jobs[0].title,
        department: jobs[0].department
      });
    } else {
      console.log('❌ No jobs found! You need to create a job first.');
      
      // Create a sample job for testing
      const sampleJob = await Job.create({
        title: 'Software Developer',
        description: 'We are looking for a skilled software developer...',
        location: 'Remote',
        department: 'Engineering',
        employmentType: 'Full-time',
        requirements: ['JavaScript', 'Node.js', 'React'],
        responsibilities: ['Develop web applications', 'Write clean code'],
        salary: { min: 50000, max: 80000, currency: 'USD' },
        status: 'active'
      });
      
      console.log('✅ Created sample job:', {
        id: sampleJob._id,
        title: sampleJob.title
      });
    }

    // Check applications
    const applications = await Application.find().limit(3);
    console.log(`📝 Found ${applications.length} applications in database`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugTest();