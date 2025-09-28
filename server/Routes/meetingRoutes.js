const express = require('express');
const router = express.Router();
const { createMeeting, getAllMeetings, markInterviewConducted } = require('../middleware/MeetingController');

// Create a new meeting
router.post('/create', createMeeting);

// Get all meetings
router.get('/all', getAllMeetings);

// Mark interview as conducted
router.put('/:meetingId/conducted', markInterviewConducted);

module.exports = router;