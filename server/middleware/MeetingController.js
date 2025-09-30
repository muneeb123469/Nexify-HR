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

// Get interviews for the logged-in applicant
exports.getApplicantInterviews = async (req, res) => {
  try {
    const applicantEmail = req.user.email;
    const applicantName = req.user.username;
    console.log(`Fetching interviews for applicant: ${applicantEmail} (${applicantName})`);

    // Find all meetings/interviews for this applicant
    // Search by candidateEmail first, then fallback to participantNames for older meetings
    const interviews = await Meeting.find({
      $or: [
        { candidateEmail: applicantEmail },
        { participantNames: { $in: [applicantName] } }
      ]
    }).sort({ date: -1, time: -1 }); // Sort by date and time, most recent first

    console.log(`Found ${interviews.length} interviews for ${applicantEmail}`);

    // Transform the data to ensure consistent format
    const transformedInterviews = interviews.map(interview => ({
      ...interview.toObject(),
      // Set default values for missing fields
      jobTitle: interview.jobTitle || 'Software Engineer Position',
      company: 'Nexify Technologies',
      interviewType: interview.interviewType || 'Technical Interview',
      interviewer: interview.interviewer || 'HR Representative',
      status: interview.status || (interview.interviewConducted ? 'Completed' : 'Upcoming'),
      location: interview.location || interview.meetingUrl || 'Location TBD'
    }));

    res.status(200).json(transformedInterviews);
  } catch (error) {
    console.error('Error fetching applicant interviews:', error);
    res.status(500).json({ error: "Failed to fetch interviews" });
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