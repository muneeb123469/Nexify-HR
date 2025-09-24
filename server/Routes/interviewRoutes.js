const express = require('express');
const router = express.Router();
const { sendInterviewEmail, testEmailConnection } = require('../services/emailService');
const { auth } = require('../middleware/auth');

// Schedule interview and send email
router.post('/schedule', async (req, res) => {
  try {
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      position,
      department,
      date,
      time,
      type,
      location,
      instructions,
      testMode
    } = req.body;

    // Validate required fields
    if (!candidateName || !candidateEmail || !position || !date || !time || !type || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for interview scheduling'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format'
      });
    }

    // Validate date (should be in the future)
    const interviewDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (interviewDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Interview date cannot be in the past'
      });
    }

    // Prepare interview details for email
    const interviewDetails = {
      candidateName,
      candidateEmail,
      candidatePhone,
      position,
      department,
      date,
      time,
      type,
      location,
      instructions
    };

    // Send interview invitation email
    console.log('Attempting to send interview email...');
    let emailResult;
    if (testMode) {
      console.log('Test mode: skipping actual email sending');
      emailResult = { success: true, messageId: 'TEST_MODE' };
    } else {
      emailResult = await sendInterviewEmail(interviewDetails);
    }

    if (emailResult.success) {
      // Log successful interview scheduling
      console.log('Interview scheduled successfully:', {
        candidate: candidateName,
        email: candidateEmail,
        position,
        date,
        time,
        messageId: emailResult.messageId
      });

      res.status(200).json({
        success: true,
        message: 'Interview scheduled and invitation sent successfully',
        data: {
          candidateName,
          candidateEmail,
          position,
          date,
          time,
          type,
          location,
          messageId: emailResult.messageId
        }
      });
    } else {
      // Email failed but we can still log the interview scheduling
      console.log('Interview scheduled but email failed:', emailResult.error);
      
      res.status(200).json({
        success: true,
        message: 'Interview scheduled successfully (email notification failed - please contact candidate manually)',
        data: {
          candidateName,
          candidateEmail,
          position,
          date,
          time,
          type,
          location
        },
        warning: 'Email notification could not be sent. Please contact the candidate manually.',
        emailError: emailResult.error
      });
    }
  } catch (error) {
    console.error('Interview scheduling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
});

// Test endpoint for interview scheduling without email
router.post('/schedule-test', async (req, res) => {
  try {
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      position,
      department,
      date,
      time,
      type,
      location,
      instructions
    } = req.body;

    // Just validate and return success without sending email
    if (!candidateName || !candidateEmail || !position || !date || !time || !type || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for interview scheduling'
      });
    }

    console.log('Test interview scheduled:', {
      candidateName,
      candidateEmail,
      position,
      date,
      time,
      type,
      location
    });

    res.status(200).json({
      success: true,
      message: 'Interview scheduled successfully (test mode - no email sent)',
      data: {
        candidateName,
        candidateEmail,
        position,
        date,
        time,
        type,
        location,
        instructions,
        testMode: true,
        messageId: 'TEST_MODE_' + Date.now()
      }
    });
  } catch (error) {
    console.error('Test interview scheduling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule test interview',
      error: error.message
    });
  }
});

// Test email service endpoint
router.get('/test-email', auth, async (req, res) => {
  try {
    const isConnected = await testEmailConnection();
    
    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'Email service is configured and ready'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email service configuration error'
      });
    }
  } catch (error) {
    console.error('Error testing email connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test email connection',
      error: error.message
    });
  }
});

// Send test interview email (for testing purposes)
router.post('/test-send', auth, async (req, res) => {
  try {
    const testInterviewDetails = {
      candidateName: 'Test Candidate',
      candidateEmail: req.body.testEmail || 'test@example.com',
      position: 'Software Developer',
      department: 'Engineering',
      date: '2024-12-25',
      time: '10:00',
      type: 'onsite',
      location: 'Main Office - Conference Room A',
      instructions: 'Please bring your ID and portfolio'
    };

    const result = await sendInterviewEmail(testInterviewDetails);
    
    res.status(200).json({
      success: result.success,
      message: result.message,
      messageId: result.messageId,
      error: result.error
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

module.exports = router;
