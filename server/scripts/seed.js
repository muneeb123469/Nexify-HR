const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Job = require('../models/Job');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';
const DEMO_PASSWORD = 'Demo@12345';
const SALT_ROUNDS = 10;

const users = [
  {
    username: 'applicantdemo',
    email: 'applicant.demo@nexify.local',
    role: 'applicant',
    isPending: false,
    approved: true,
  },
  {
    username: 'hrdemo',
    email: 'hr.demo@nexify.local',
    role: 'hr',
    isPending: false,
    approved: true,
  },
  {
    username: 'employeedemo',
    email: 'employee.demo@nexify.local',
    role: 'employee',
    isPending: false,
    approved: true,
  },
  {
    username: 'admindemo',
    email: 'admin.demo@nexify.local',
    role: 'admin',
    isPending: false,
    approved: true,
  },
];

const jobs = [
  {
    title: 'Frontend React Developer',
    description: 'Build responsive applicant and HR portal interfaces using React.',
    location: 'Lahore, Pakistan',
    department: 'Engineering',
    employmentType: 'Full-time',
    requirements: ['React', 'JavaScript', 'CSS', 'REST APIs'],
    responsibilities: ['Develop UI components', 'Integrate backend APIs', 'Fix frontend bugs'],
    salary: { min: 90000, max: 160000, currency: 'PKR' },
    status: 'active',
  },
  {
    title: 'HR Operations Specialist',
    description: 'Support hiring operations, candidate screening, and HR coordination.',
    location: 'Remote',
    department: 'HR',
    employmentType: 'Full-time',
    requirements: ['Recruitment', 'Communication', 'Applicant tracking'],
    responsibilities: ['Review applications', 'Coordinate interviews', 'Maintain candidate records'],
    salary: { min: 70000, max: 120000, currency: 'PKR' },
    status: 'active',
  },
  {
    title: 'Backend Node.js Developer',
    description: 'Maintain Express APIs and MongoDB data models for the HR portal.',
    location: 'Karachi, Pakistan',
    department: 'Engineering',
    employmentType: 'Contract',
    requirements: ['Node.js', 'Express', 'MongoDB', 'Mongoose'],
    responsibilities: ['Build API endpoints', 'Improve data validation', 'Support file uploads'],
    salary: { min: 120000, max: 220000, currency: 'PKR' },
    status: 'open',
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);

  for (const user of users) {
    const hashedDemoPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

    await User.updateOne(
      { email: user.email },
      {
        $set: {
          ...user,
          password: hashedDemoPassword,
        },
      },
      { upsert: true },
    );
  }

  for (const job of jobs) {
    await Job.updateOne(
      { title: job.title, department: job.department },
      { $setOnInsert: job },
      { upsert: true },
    );
  }

  console.log(`Seed complete: ${users.length} users, ${jobs.length} jobs`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
