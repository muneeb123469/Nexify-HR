const mongoose = require('mongoose');

// Education schema for parsed resume data
const EducationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startDate: String,
  endDate: String,
  grade: String,
});

// Experience schema for parsed resume data
const ExperienceSchema = new mongoose.Schema({
  company: String,
  title: String,
  startDate: String,
  endDate: String,
  location: String,
  description: String,
});

// Parsed resume data schema (from Python CV parser)
const ParsedResumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: String,
  links: [String],
  skills: [String],
  summary: String,
  education: [EducationSchema],
  experience: [ExperienceSchema],
  certifications: [String],
  languages: [String],
  rawText: String,          // optional, for search/debug
  confidence: Number,       // 0..1
  parserVersion: String,    // e.g., "cvp-1.0.0"
  parsedAt: Date
}, { _id: false });

// Main application schema
const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  // Snapshot fields preserve historical application data if the job is deleted later.
  jobTitle: {
    type: String
  },
  jobDepartment: {
    type: String
  },
  jobLocation: {
    type: String
  },
  company: {
    type: String,
    default: 'Nexify HR'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  // Include parsed resume data from CV parser
  parsedResume: ParsedResumeSchema,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate applications from the same email for the same job
applicationSchema.index({ job: 1, email: 1 }, { unique: true });

// Export the model with safety check to prevent overwrite errors
module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);
