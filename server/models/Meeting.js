const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  participantNames: {
    type: [String],
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  meetingUrl: {
    type: String,
    required: true
  },
  hrModeratorUrl: {
    type: String,
    required: false
  },
  interviewConducted: {
    type: Boolean,
    default: false
  },
  // Interview-specific fields
  candidateEmail: {
    type: String,
    required: false
  },
  jobTitle: {
    type: String,
    required: false
  },
  company: {
    type: String,
    required: false
  },
  interviewType: {
    type: String,
    enum: ['Technical Interview', 'HR Interview', 'Behavioral Interview', 'Final Interview'],
    required: false
  },
  interviewer: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  result: {
    type: String,
    enum: ['Passed', 'Failed', 'Pending'],
    required: false
  },
  feedback: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  // Applicant feedback fields
  applicantFeedback: {
    type: String,
    required: false
  },
  applicantRating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  feedbackSubmittedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Static methods
meetingSchema.statics.createMeeting = async function(data) {
  if (!data.date || !data.time || !data.participantNames || !data.duration || !data.meetingUrl) {
    throw new Error("Missing required fields.");
  }

  const meeting = new this(data);
  return await meeting.save();
};

meetingSchema.statics.getAllMeetings = async function() {
  return await this.find({});
};

meetingSchema.statics.markInterviewConducted = async function(meetingId) {
  return await this.findByIdAndUpdate(
    meetingId, 
    { 
      interviewConducted: true,
      status: 'Completed'
    }, 
    { new: true }
  );
};

// Export the model with safety check to prevent overwrite errors
module.exports = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);