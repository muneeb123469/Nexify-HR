const express = require('express');
const router = express.Router();
const { createMeeting, getAllMeetings, markInterviewConducted, getApplicantInterviews, submitApplicantFeedback } = require('../middleware/MeetingController');
const { auth } = require('../middleware/auth');

// Create a new meeting
router.post('/create', createMeeting);

// Get all meetings
router.get('/all', getAllMeetings);

// Get interviews for the logged-in applicant
router.get('/applicant/interviews', auth, getApplicantInterviews);

// Mark interview as conducted
router.put('/:meetingId/conducted', markInterviewConducted);

// Submit applicant feedback for interview
router.put('/:meetingId/feedback', auth, submitApplicantFeedback);

module.exports = router;