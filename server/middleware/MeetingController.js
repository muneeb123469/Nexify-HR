const Meeting = require("../models/Meeting");

// Create Meeting
exports.createMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.createMeeting(req.body);
    res.status(201).json({ message: "Meeting created", meeting });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Meetings
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.getAllMeetings();
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
};

// Mark Interview as Conducted
exports.markInterviewConducted = async (req, res) => {
  try {
    const meeting = await Meeting.markInterviewConducted(req.params.meetingId);
    res.status(200).json({ message: "Interview marked as conducted", meeting });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};