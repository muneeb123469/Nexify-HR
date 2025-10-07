const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Location = require('../models/Location');
const { auth } = require('../middleware/auth');

// Check In - Employee marks their presence
router.post('/attendance/checkin', auth, async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { latitude, longitude } = req.body;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Validate location if coordinates are provided
    if (latitude && longitude) {
      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided'
        });
      }

      // Check if user is within any approved location
      const locations = await Location.find({ isActive: true });
      const validLocations = locations.filter(location => {
        return location.isWithinRadius(parseFloat(latitude), parseFloat(longitude));
      });

      if (validLocations.length === 0) {
        // Find nearest location for helpful error message
        let nearestLocation = null;
        let nearestDistance = Infinity;
        
        locations.forEach(location => {
          const distance = location.calculateDistance(parseFloat(latitude), parseFloat(longitude));
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestLocation = location;
          }
        });

        return res.status(403).json({
          success: false,
          message: 'You are not within any approved location for attendance',
          nearestLocation: nearestLocation ? {
            name: nearestLocation.name,
            distance: Math.round(nearestDistance),
            requiredRadius: nearestLocation.radius
          } : null
        });
      }
    }

    // Find or create attendance record for today
    let attendance = await Attendance.findOne({
      employeeId,
      date: dateOnly
    });

    // Get employee details
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (!attendance) {
      // Create new attendance record for the day
      attendance = new Attendance({
        employeeId,
        employeeName: employee.username,
        employeeEmail: employee.email,
        date: dateOnly,
        sessions: [{
          checkInAt: new Date(),
          checkOutAt: null
        }],
        status: 'checked-in'
      });
    } else {
      // Check if employee can check in (not currently checked in)
      if (!attendance.canCheckIn()) {
        return res.status(400).json({
          success: false,
          message: 'You are already checked in. Please check out first before checking in again.'
        });
      }
      
      // Add new session
      attendance.sessions.push({
        checkInAt: new Date(),
        checkOutAt: null
      });
      attendance.calculateWorkingHours();
    }

    await attendance.save();

    const sessionInfo = attendance.getCurrentSession();
    
    res.json({
      success: true,
      message: 'Successfully checked in',
      data: {
        id: attendance._id,
        lastCheckInTime: sessionInfo.lastCheckIn,
        lastCheckOutTime: sessionInfo.lastCheckOut,
        totalSessions: sessionInfo.totalSessions,
        completedSessions: sessionInfo.completedSessions,
        isCurrentlyCheckedIn: sessionInfo.isCurrentlyCheckedIn,
        workingHours: attendance.workingHours,
        formattedWorkingHours: attendance.formattedWorkingHours,
        status: attendance.status,
        sessions: sessionInfo.sessions
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-in'
    });
  }
});

// Check Out - Employee marks their departure
router.post('/attendance/checkout', auth, async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { latitude, longitude } = req.body;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Validate location if coordinates are provided
    if (latitude && longitude) {
      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided'
        });
      }

      // Check if user is within any approved location
      const locations = await Location.find({ isActive: true });
      const validLocations = locations.filter(location => {
        return location.isWithinRadius(parseFloat(latitude), parseFloat(longitude));
      });

      if (validLocations.length === 0) {
        // Find nearest location for helpful error message
        let nearestLocation = null;
        let nearestDistance = Infinity;
        
        locations.forEach(location => {
          const distance = location.calculateDistance(parseFloat(latitude), parseFloat(longitude));
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestLocation = location;
          }
        });

        return res.status(403).json({
          success: false,
          message: 'You are not within any approved location for attendance',
          nearestLocation: nearestLocation ? {
            name: nearestLocation.name,
            distance: Math.round(nearestDistance),
            requiredRadius: nearestLocation.radius
          } : null
        });
      }
    }

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employeeId,
      date: dateOnly
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No attendance record found for today. Please check in first.'
      });
    }

    // Check if employee can check out (currently checked in)
    if (!attendance.canCheckOut()) {
      return res.status(400).json({
        success: false,
        message: 'You are not currently checked in'
      });
    }

    // Find the active session and add check-out time
    const activeSession = attendance.sessions.find(session => session.checkInAt && !session.checkOutAt);
    if (activeSession) {
      activeSession.checkOutAt = new Date();
    }
    
    attendance.calculateWorkingHours();

    await attendance.save();

    const updatedSessionInfo = attendance.getCurrentSession();

    res.json({
      success: true,
      message: 'Successfully checked out',
      data: {
        id: attendance._id,
        lastCheckInTime: updatedSessionInfo.lastCheckIn,
        lastCheckOutTime: updatedSessionInfo.lastCheckOut,
        totalSessions: updatedSessionInfo.totalSessions,
        completedSessions: updatedSessionInfo.completedSessions,
        isCurrentlyCheckedIn: updatedSessionInfo.isCurrentlyCheckedIn,
        workingHours: attendance.workingHours,
        formattedWorkingHours: attendance.formattedWorkingHours,
        status: attendance.status,
        sessions: updatedSessionInfo.sessions
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-out'
    });
  }
});

// Get today's attendance status
router.get('/attendance/today', auth, async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const attendance = await Attendance.findOne({
      employeeId,
      date: dateOnly
    });

    if (!attendance) {
      return res.json({
        success: true,
        data: {
          hasCheckedIn: false,
          isCurrentlyCheckedIn: false,
          totalSessions: 0,
          completedSessions: 0,
          workingHours: "0:00",
          formattedWorkingHours: '0h 0m',
          status: 'not-checked-in',
          sessions: []
        }
      });
    }

    const sessionInfo = attendance.getCurrentSession();

    res.json({
      success: true,
      data: {
        id: attendance._id,
        hasCheckedIn: sessionInfo.totalSessions > 0,
        isCurrentlyCheckedIn: sessionInfo.isCurrentlyCheckedIn,
        lastCheckInTime: sessionInfo.lastCheckIn,
        lastCheckOutTime: sessionInfo.lastCheckOut,
        totalSessions: sessionInfo.totalSessions,
        completedSessions: sessionInfo.completedSessions,
        workingHours: attendance.workingHours,
        formattedWorkingHours: attendance.formattedWorkingHours,
        status: attendance.status,
        sessions: sessionInfo.sessions
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance status'
    });
  }
});

// Get attendance history for employee
router.get('/attendance/history', auth, async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { page = 1, limit = 10, month, year } = req.query;

    let dateFilter = { employeeId };

    // Add date filters if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter.date = {
        $gte: startDate,
        $lte: endDate
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      dateFilter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const attendance = await Attendance.find(dateFilter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(dateFilter);

    res.json({
      success: true,
      data: attendance,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance history'
    });
  }
});

// Get attendance statistics for employee
router.get('/attendance/stats', auth, async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { month, year } = req.query;
    
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const attendance = await Attendance.find({
      employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const stats = {
      totalDays: attendance.length,
      presentDays: attendance.filter(a => a.status === 'checked-out').length,
      checkedInOnly: attendance.filter(a => a.status === 'checked-in').length,
      totalWorkingHours: attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0),
      averageWorkingHours: 0
    };

    if (stats.presentDays > 0) {
      stats.averageWorkingHours = Math.round(stats.totalWorkingHours / stats.presentDays);
    }

    // Format working hours
    stats.formattedTotalHours = `${Math.floor(stats.totalWorkingHours / 60)}h ${stats.totalWorkingHours % 60}m`;
    stats.formattedAverageHours = `${Math.floor(stats.averageWorkingHours / 60)}h ${stats.averageWorkingHours % 60}m`;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics'
    });
  }
});

// HR Routes - Get all employees attendance
router.get('/attendance/all', auth, async (req, res) => {
  try {
    // Only HR can access all attendance data
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR role required.'
      });
    }

    const { date, employeeName, status, page = 1, limit = 100 } = req.query;
    let filter = {};

    // Date filter
    if (date) {
      const targetDate = new Date(date);
      const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      filter.date = dateOnly;
    } else {
      // Default to today
      const today = new Date();
      const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      filter.date = dateOnly;
    }

    // Employee name filter
    if (employeeName) {
      filter.employeeName = { $regex: employeeName, $options: 'i' };
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'not-checked-in') {
        // Find all employees who haven't checked in today
        const allUsers = await User.find({ role: 'employee' }).select('username email');
        const checkedInEmployees = await Attendance.find(filter).distinct('employeeId');
        
        const notCheckedInEmployees = allUsers.filter(user => 
          !checkedInEmployees.some(id => id.toString() === user._id.toString())
        );

        return res.json({
          success: true,
          data: {
            attendance: notCheckedInEmployees.map(user => ({
              _id: `not-checked-in-${user._id}`,
              employeeId: user._id,
              employeeName: user.username,
              employeeEmail: user.email,
              date: filter.date,
              status: 'not-checked-in',
              sessions: [],
              workingHours: '0:00',
              formattedWorkingHours: '0h 0m'
            })),
            pagination: {
              currentPage: parseInt(page),
              totalPages: 1,
              totalRecords: notCheckedInEmployees.length
            }
          }
        });
      } else {
        filter.status = status;
      }
    }

    const attendance = await Attendance.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(filter);

    // If no status filter or status is 'all', also include employees who haven't checked in
    let allAttendanceData = [...attendance];
    
    if (!status || status === 'all') {
      const allUsers = await User.find({ role: 'employee' }).select('username email');
      const checkedInEmployees = attendance.map(record => record.employeeId.toString());
      
      const notCheckedInEmployees = allUsers.filter(user => 
        !checkedInEmployees.includes(user._id.toString())
      );

      const notCheckedInRecords = notCheckedInEmployees.map(user => ({
        _id: `not-checked-in-${user._id}`,
        employeeId: user._id,
        employeeName: user.username,
        employeeEmail: user.email,
        date: filter.date,
        status: 'not-checked-in',
        sessions: [],
        workingHours: '0:00',
        formattedWorkingHours: '0h 0m'
      }));

      allAttendanceData = [...attendance, ...notCheckedInRecords];
    }

    res.json({
      success: true,
      data: {
        attendance: allAttendanceData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((total + (allAttendanceData.length - attendance.length)) / limit),
          totalRecords: allAttendanceData.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance data'
    });
  }
});

// Get employee attendance history for a specific month
router.get('/attendance/employee/:employeeId/history', auth, async (req, res) => {
  try {
    // Only HR can access employee history
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR role required.'
      });
    }

    const { employeeId } = req.params;
    const { month } = req.query; // Expected format: YYYY-MM

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month parameter is required (format: YYYY-MM)'
      });
    }

    // Parse month and create date range
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Fetch attendance records for the employee in the specified month
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: attendanceRecords
    });
  } catch (error) {
    console.error('Error fetching employee history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee attendance history'
    });
  }
});

module.exports = router;
