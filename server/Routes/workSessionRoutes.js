const express = require('express');
const router = express.Router();
const WorkSession = require('../models/WorkSession');
const User = require('../models/User');
const { auth: verifyToken } = require('../middleware/auth');

// Middleware to check if user is HR or Admin
const isHROrAdmin = (req, res, next) => {
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. HR or Admin role required.' });
    }
    next();
};

// @route   POST /api/work-sessions/start
// @desc    Start a new work session
// @access  Private (Employee)
router.post('/start', verifyToken, async (req, res) => {
    try {
        const employeeId = req.user._id;

        // Check if there's already an active session
        const activeSession = await WorkSession.getActiveSession(employeeId);
        if (activeSession) {
            return res.status(400).json({
                message: 'You already have an active work session. Please end it before starting a new one.',
                activeSession
            });
        }

        // Get employee details
        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Create new work session
        const workSession = new WorkSession({
            employeeId: employee._id,
            employeeName: employee.username,
            employeeEmail: employee.email,
            department: employee.department || 'Not Specified',
            startTime: new Date(),
            status: 'active'
        });

        await workSession.save();

        res.status(201).json({
            message: 'Work session started successfully',
            session: workSession
        });
    } catch (error) {
        console.error('Error starting work session:', error);
        res.status(500).json({
            message: 'Error starting work session',
            error: error.message
        });
    }
});

// @route   GET /api/work-sessions/active
// @desc    Get current active session for logged-in employee
// @access  Private (Employee)
router.get('/active', verifyToken, async (req, res) => {
    try {
        const activeSession = await WorkSession.getActiveSession(req.user._id);

        if (!activeSession) {
            return res.json({
                message: 'No active session found',
                session: null
            });
        }

        res.json({
            session: activeSession
        });
    } catch (error) {
        console.error('Error fetching active session:', error);
        res.status(500).json({
            message: 'Error fetching active session',
            error: error.message
        });
    }
});

// @route   PUT /api/work-sessions/:sessionId/break/start
// @desc    Start a break in current session
// @access  Private (Employee)
router.put('/:sessionId/break/start', verifyToken, async (req, res) => {
    try {
        const session = await WorkSession.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Work session not found' });
        }

        // Check if user owns this session
        if (session.employeeId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await session.startBreak();

        res.json({
            message: 'Break started successfully',
            session
        });
    } catch (error) {
        console.error('Error starting break:', error);
        res.status(400).json({
            message: error.message || 'Error starting break',
            error: error.message
        });
    }
});

// @route   PUT /api/work-sessions/:sessionId/break/end
// @desc    End current break
// @access  Private (Employee)
router.put('/:sessionId/break/end', verifyToken, async (req, res) => {
    try {
        const session = await WorkSession.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Work session not found' });
        }

        // Check if user owns this session
        if (session.employeeId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await session.endBreak();

        res.json({
            message: 'Break ended successfully',
            session
        });
    } catch (error) {
        console.error('Error ending break:', error);
        res.status(400).json({
            message: error.message || 'Error ending break',
            error: error.message
        });
    }
});

// @route   PUT /api/work-sessions/:sessionId/end
// @desc    End current work session
// @access  Private (Employee)
router.put('/:sessionId/end', verifyToken, async (req, res) => {
    try {
        const session = await WorkSession.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Work session not found' });
        }

        // Check if user owns this session
        if (session.employeeId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await session.endSession();

        res.json({
            message: 'Work session ended successfully',
            session
        });
    } catch (error) {
        console.error('Error ending work session:', error);
        res.status(400).json({
            message: error.message || 'Error ending work session',
            error: error.message
        });
    }
});

// @route   GET /api/work-sessions/my-sessions
// @desc    Get all sessions for logged-in employee
// @access  Private (Employee)
router.get('/my-sessions', verifyToken, async (req, res) => {
    try {
        const { startDate, endDate, date, status } = req.query;

        const filters = {};
        if (startDate && endDate) {
            filters.startDate = startDate;
            filters.endDate = endDate;
        } else if (date) {
            filters.date = date;
        }
        if (status) {
            filters.status = status;
        }

        const sessions = await WorkSession.getEmployeeSessions(req.user._id, filters);

        res.json({
            count: sessions.length,
            sessions
        });
    } catch (error) {
        console.error('Error fetching employee sessions:', error);
        res.status(500).json({
            message: 'Error fetching sessions',
            error: error.message
        });
    }
});

// @route   GET /api/work-sessions/all
// @desc    Get all work sessions (HR/Admin only)
// @access  Private (HR/Admin)
router.get('/all', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { employeeId, department, startDate, endDate, date, status } = req.query;

        const filters = {};
        if (employeeId) filters.employeeId = employeeId;
        if (department) filters.department = department;
        if (startDate && endDate) {
            filters.startDate = startDate;
            filters.endDate = endDate;
        } else if (date) {
            filters.date = date;
        }
        if (status) filters.status = status;

        const sessions = await WorkSession.getAllSessions(filters);

        res.json({
            count: sessions.length,
            sessions
        });
    } catch (error) {
        console.error('Error fetching all sessions:', error);
        res.status(500).json({
            message: 'Error fetching sessions',
            error: error.message
        });
    }
});

// @route   GET /api/work-sessions/employee/:employeeId
// @desc    Get sessions for specific employee (HR/Admin only)
// @access  Private (HR/Admin)
router.get('/employee/:employeeId', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { startDate, endDate, date, status } = req.query;

        const filters = {};
        if (startDate && endDate) {
            filters.startDate = startDate;
            filters.endDate = endDate;
        } else if (date) {
            filters.date = date;
        }
        if (status) {
            filters.status = status;
        }

        const sessions = await WorkSession.getEmployeeSessions(req.params.employeeId, filters);

        res.json({
            count: sessions.length,
            sessions
        });
    } catch (error) {
        console.error('Error fetching employee sessions:', error);
        res.status(500).json({
            message: 'Error fetching sessions',
            error: error.message
        });
    }
});

// @route   GET /api/work-sessions/report
// @desc    Generate work hours report (HR/Admin only)
// @access  Private (HR/Admin)
router.get('/report', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { employeeId, department, startDate, endDate } = req.query;

        const filters = {};
        if (employeeId) filters.employeeId = employeeId;
        if (department) filters.department = department;
        if (startDate && endDate) {
            filters.startDate = startDate;
            filters.endDate = endDate;
        }
        filters.status = 'completed'; // Only completed sessions for reports

        const sessions = await WorkSession.getAllSessions(filters);

        // Calculate summary statistics
        const summary = {
            totalSessions: sessions.length,
            totalHours: sessions.reduce((sum, s) => sum + (s.totalHours || 0), 0),
            totalProductiveHours: sessions.reduce((sum, s) => sum + (s.productiveHours || 0), 0),
            totalBreakMinutes: sessions.reduce((sum, s) => sum + (s.totalBreakMinutes || 0), 0),
            averageHoursPerSession: 0,
            averageProductiveHoursPerSession: 0
        };

        if (sessions.length > 0) {
            summary.averageHoursPerSession = parseFloat((summary.totalHours / sessions.length).toFixed(2));
            summary.averageProductiveHoursPerSession = parseFloat((summary.totalProductiveHours / sessions.length).toFixed(2));
        }

        res.json({
            summary,
            sessions
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            message: 'Error generating report',
            error: error.message
        });
    }
});

module.exports = router;
