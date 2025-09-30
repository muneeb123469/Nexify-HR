const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
require('dotenv').config();

// Sample interview data
const sampleInterviews = [
  {
    date: '2024-04-15',
    time: '10:00 AM',
    participantNames: ['John Doe', 'Sarah Johnson'],
    duration: 60,
    meetingUrl: 'https://meet.jit.si/interview-room-1',
    candidateEmail: 'john.doe@example.com',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Corp',
    interviewType: 'Technical Interview',
    interviewer: 'Sarah Johnson',
    location: 'Virtual (Jitsi)',
    status: 'Upcoming',
    notes: 'Please prepare for coding questions and system design discussion'
  },
  {
    date: '2024-03-20',
    time: '2:00 PM',
    participantNames: ['John Doe', 'Mike Brown'],
    duration: 45,
    meetingUrl: 'https://meet.jit.si/interview-room-2',
    candidateEmail: 'john.doe@example.com',
    jobTitle: 'Frontend Developer',
    company: 'Web Solutions',
    interviewType: 'HR Interview',
    interviewer: 'Mike Brown',
    location: 'Virtual (Jitsi)',
    status: 'Completed',
    result: 'Passed',
    feedback: 'Strong communication skills and good technical knowledge'
  },
  {
    date: '2024-03-10',
    time: '11:00 AM',
    participantNames: ['John Doe', 'Lisa Chen'],
    duration: 90,
    meetingUrl: 'https://meet.jit.si/interview-room-3',
    candidateEmail: 'john.doe@example.com',
    jobTitle: 'Full Stack Developer',
    company: 'Digital Innovations',
    interviewType: 'Technical Interview',
    interviewer: 'Lisa Chen',
    location: 'Office - Conference Room A',
    status: 'Completed',
    result: 'Failed',
    feedback: 'Need to improve on system design concepts'
  }
];

async function createSampleInterviews() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sample interviews for this email
    await Meeting.deleteMany({ candidateEmail: 'john.doe@example.com' });
    console.log('Cleared existing sample interviews');

    // Create new sample interviews
    const createdInterviews = await Meeting.insertMany(sampleInterviews);
    console.log(`Created ${createdInterviews.length} sample interviews`);

    console.log('Sample interviews created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample interviews:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  createSampleInterviews();
}

module.exports = { createSampleInterviews, sampleInterviews };