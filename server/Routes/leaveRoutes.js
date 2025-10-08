const express = require('express');
const router = express.Router();
const LeaveApplication = require('../models/LeaveApplication');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Apply for leave
router.post('/apply', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        errors: ['Please fill in all required fields']
      });
    }

    // Get employee details from authenticated user
    const employee = await User.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await LeaveApplication.findOne({
      employeeId: employee._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for overlapping dates'
      });
    }

    // Create leave application
    const leaveApplication = new LeaveApplication({
      employeeId: employee._id,
      employeeName: employee.username,
      employeeEmail: employee.email,
      department: employee.department || 'Not specified',
      leaveType,
      startDate: start,
      endDate: end,
      reason
    });

    await leaveApplication.save();

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveApplication
    });

  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing leave request',
      errors: [error.message]
    });
  }
});

// Get employee's leave requests
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if user is requesting their own data or is HR
    if (req.user.id !== employeeId && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const leaveRequests = await LeaveApplication.find({ employeeId })
      .sort({ appliedDate: -1 })
      .populate('reviewedBy', 'username');

    res.json({
      success: true,
      data: leaveRequests
    });

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leave requests'
    });
  }
});

// Get all leave requests (HR only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR access required.'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    
    const leaveRequests = await LeaveApplication.find(query)
      .sort({ appliedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employeeId', 'username email department')
      .populate('reviewedBy', 'username');

    const total = await LeaveApplication.countDocuments(query);

    res.json({
      success: true,
      data: leaveRequests,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leave requests'
    });
  }
});

// Update leave request status (HR only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR access required.'
      });
    }

    const { id } = req.params;
    const { status, reviewComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected.'
      });
    }

    const leaveApplication = await LeaveApplication.findById(id);
    if (!leaveApplication) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    leaveApplication.status = status;
    leaveApplication.reviewedBy = req.user.id;
    leaveApplication.reviewedDate = new Date();
    leaveApplication.reviewComments = reviewComments || '';

    await leaveApplication.save();

    res.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leaveApplication
    });

  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating leave status'
    });
  }
});

module.exports = router;