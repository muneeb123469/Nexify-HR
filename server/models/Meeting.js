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
  return await this.findByIdAndUpdate(meetingId, { interviewConducted: true }, { new: true });
};

// Export the model with safety check to prevent overwrite errors
module.exports = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);