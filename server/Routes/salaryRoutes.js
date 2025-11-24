const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const WorkSession = require('../models/WorkSession');
const Salary = require('../models/Salary');
const { auth: verifyToken } = require('../middleware/auth');

// Middleware to check if user is HR or Admin
const isHROrAdmin = (req, res, next) => {
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. HR or Admin role required.' });
    }
    next();
};

// Constants for salary calculation
const STANDARD_MONTHLY_HOURS = 176;

/**
 * Get total work hours from Attendance records
 */
async function getAttendanceHours(employeeId, month, year) {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const attendanceRecords = await Attendance.find({
            employeeId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        });

        // Sum up total working minutes and convert to hours
        const totalMinutes = attendanceRecords.reduce((sum, record) => {
            return sum + (record.totalWorkingMinutes || 0);
        }, 0);

        return totalMinutes / 60; // Convert to hours
    } catch (error) {
        console.error('Error getting attendance hours:', error);
        return 0;
    }
}

/**
 * Get total work hours from WorkSession records (remote work)
 */
async function getRemoteWorkHours(employeeId, month, year) {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const workSessions = await WorkSession.find({
            employeeId,
            status: 'completed',
            date: {
                $gte: startDate,
                $lte: endDate
            }
        });

        // Sum up productive hours
        const totalHours = workSessions.reduce((sum, session) => {
            return sum + (session.productiveHours || 0);
        }, 0);

        return totalHours;
    } catch (error) {
        console.error('Error getting remote work hours:', error);
        return 0;
    }
}

/**
 * Get combined total work hours from both attendance and remote work
 */
async function getTotalWorkHours(employeeId, month, year) {
    const attendanceHours = await getAttendanceHours(employeeId, month, year);
    const remoteHours = await getRemoteWorkHours(employeeId, month, year);

    return {
        attendanceHours,
        remoteHours,
        totalHours: attendanceHours + remoteHours
    };
}

/**
 * Calculate salary for Full-time permanent employees
 * Now calculates based on actual hours worked (same as part-time)
 */
function calculateFullTimeSalary(hourlyRate, actualHours) {
    const salary = hourlyRate * actualHours;

    return {
        baseSalary: salary,
        deductions: 0,
        netSalary: salary,
        details: {
            actualHours,
            hourlyRate,
            standardHours: STANDARD_MONTHLY_HOURS,
            calculation: 'Based on actual hours worked'
        }
    };
}

/**
 * Calculate salary for Part-time employees
 */
function calculatePartTimeSalary(hourlyRate, actualHours) {
    const salary = hourlyRate * actualHours;

    return {
        baseSalary: salary,
        deductions: 0,
        netSalary: salary,
        details: {
            actualHours,
            hourlyRate,
            calculation: 'Based on actual hours worked'
        }
    };
}

/**
 * Calculate salary for Contract-based employees
 */
function calculateContractSalary(hourlyRate, actualHours) {
    const requiredHours = STANDARD_MONTHLY_HOURS;

    if (actualHours >= requiredHours) {
        // Full salary if worked required hours or more
        const fullSalary = hourlyRate * requiredHours;
        return {
            baseSalary: fullSalary,
            deductions: 0,
            netSalary: fullSalary,
            details: {
                requiredHours,
                actualHours,
                hourlyRate,
                status: 'Full salary (met required hours)'
            }
        };
    } else {
        // Proportional salary if worked less than required
        const proportionalSalary = hourlyRate * actualHours;
        const potentialSalary = hourlyRate * requiredHours;
        const shortfall = requiredHours - actualHours;

        return {
            baseSalary: potentialSalary,
            deductions: hourlyRate * shortfall,
            netSalary: proportionalSalary,
            details: {
                requiredHours,
                actualHours,
                hourlyRate,
                shortfallHours: shortfall,
                status: 'Proportional salary (below required hours)'
            }
        };
    }
}

/**
 * Main salary calculation function
 */
async function calculateEmployeeSalary(employeeId, month, year) {
    try {
        const employee = await User.findById(employeeId);

        if (!employee || employee.role !== 'employee') {
            throw new Error('Employee not found');
        }

        // Get work hours from both sources
        const workHoursData = await getTotalWorkHours(employeeId, month, year);

        // Get hourly rate
        const hourlyRate = employee.salary || 0;

        if (hourlyRate === 0) {
            throw new Error('Employee hourly rate not set');
        }

        let salaryData;
        const employeeType = employee.employeeStatus;

        // Calculate based on employee type - now all use actual hours
        if (employeeType === 'Full-time permanent employee') {
            salaryData = calculateFullTimeSalary(hourlyRate, workHoursData.totalHours);
        } else if (employeeType === 'Part-time employee') {
            salaryData = calculatePartTimeSalary(hourlyRate, workHoursData.totalHours);
        } else if (employeeType === 'Contract-based employee') {
            salaryData = calculateContractSalary(hourlyRate, workHoursData.totalHours);
        } else {
            // Default calculation for other types (e.g., Intern)
            salaryData = calculatePartTimeSalary(hourlyRate, workHoursData.totalHours);
        }

        return {
            employeeId: employee._id,
            employeeName: employee.username,
            employeeEmail: employee.email,
            department: employee.department,
            position: employee.jobTitle,
            employeeType,
            month,
            year,
            hourlyRate,
            workHours: workHoursData,
            ...salaryData
        };
    } catch (error) {
        console.error('Error calculating employee salary:', error);
        throw error;
    }
}

// @route   GET /api/salary/calculate/:employeeId
// @desc    Calculate salary for specific employee
// @access  Private (HR/Admin)
router.get('/calculate/:employeeId', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        // Default to current month/year if not provided
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        const salaryData = await calculateEmployeeSalary(employeeId, targetMonth, targetYear);

        res.json({
            success: true,
            data: salaryData
        });
    } catch (error) {
        console.error('Error in calculate salary:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error calculating salary'
        });
    }
});

// @route   GET /api/salary/calculate-all
// @desc    Calculate salaries for all employees
// @access  Private (HR/Admin)
router.get('/calculate-all', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { month, year } = req.query;

        // Default to current month/year if not provided
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        // Get all active employees
        const employees = await User.find({
            role: 'employee',
            status: { $ne: 'Terminated' }
        });

        const salariesData = [];

        for (const employee of employees) {
            try {
                const salaryData = await calculateEmployeeSalary(employee._id, targetMonth, targetYear);
                salariesData.push(salaryData);
            } catch (error) {
                console.error(`Error calculating salary for ${employee.username}:`, error);
                // Continue with other employees even if one fails
                salariesData.push({
                    employeeId: employee._id,
                    employeeName: employee.username,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            count: salariesData.length,
            month: targetMonth,
            year: targetYear,
            data: salariesData
        });
    } catch (error) {
        console.error('Error in calculate all salaries:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error calculating salaries'
        });
    }
});

// @route   POST /api/salary/approve/:employeeId
// @desc    Approve or reject salary for an employee
// @access  Private (HR/Admin)
router.post('/approve/:employeeId', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { status, month, year } = req.body;

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "approved" or "rejected"'
            });
        }

        // Check if employee exists
        const employee = await User.findById(employeeId);
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Calculate current salary data
        const salaryData = await calculateEmployeeSalary(employeeId, month, year);

        // Update or create salary record with approval status
        const salaryRecord = await Salary.findOneAndUpdate(
            { employeeId, month, year },
            {
                employeeId,
                month,
                year,
                baseSalary: salaryData.baseSalary,
                bonuses: salaryData.bonuses || 0,
                deductions: salaryData.deductions || 0,
                netSalary: salaryData.netSalary,
                workHours: salaryData.workHours,
                status: status,
                approvedBy: req.user.userId,
                approvedAt: status === 'approved' ? new Date() : null
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: `Salary ${status} successfully`,
            data: salaryRecord
        });
    } catch (error) {
        console.error('Error approving salary:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating approval status'
        });
    }
});

// @route   GET /api/salary/approved
// @desc    Get all approved salaries
// @access  Private (HR/Admin)
router.get('/approved', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { month, year } = req.query;

        // Build query
        const query = { status: 'approved' };
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        console.log('Debug - Query Params:', { month, year });
        console.log('Debug - MongoDB Query:', query);

        const approvedSalaries = await Salary.find(query).populate('employeeId', 'username email jobTitle department employeeStatus');
        console.log('Debug - Populated Salaries:', approvedSalaries.length);

        // Transform data to match frontend format
        const transformedData = approvedSalaries.map(salary => ({
            id: salary.employeeId._id,
            employeeId: salary.employeeId._id,
            employeeName: salary.employeeId.username,
            employeeEmail: salary.employeeId.email,
            position: salary.employeeId.jobTitle,
            department: salary.employeeId.department,
            employeeType: salary.employeeId.employeeStatus,
            month: salary.month,
            year: salary.year,
            baseSalary: salary.baseSalary,
            bonuses: salary.bonuses,
            deductions: salary.deductions,
            netSalary: salary.netSalary,
            workHours: salary.workHours,
            status: salary.status,
            approvedAt: salary.approvedAt
        }));

        res.json({
            success: true,
            count: transformedData.length,
            employees: transformedData
        });
    } catch (error) {
        console.error('Error fetching approved salaries:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching approved salaries'
        });
    }
});

// @route   POST /api/salary/monthly-report
// @desc    Generate monthly salary report with filters
// @access  Private (HR/Admin)
router.post('/monthly-report', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { month, year, department, employeeType } = req.body;

        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();

        // Build query
        const query = {
            role: 'employee',
            status: { $ne: 'Terminated' }
        };

        if (department) query.department = department;
        if (employeeType) query.employeeStatus = employeeType;

        const employees = await User.find(query);

        const salariesData = [];
        let totalBaseSalary = 0;
        let totalDeductions = 0;
        let totalNetSalary = 0;

        for (const employee of employees) {
            try {
                const salaryData = await calculateEmployeeSalary(employee._id, targetMonth, targetYear);
                salariesData.push(salaryData);

                totalBaseSalary += salaryData.baseSalary || 0;
                totalDeductions += salaryData.deductions || 0;
                totalNetSalary += salaryData.netSalary || 0;
            } catch (error) {
                console.error(`Error calculating salary for ${employee.username}:`, error);
            }
        }

        const summary = {
            totalEmployees: salariesData.length,
            totalBaseSalary: Math.round(totalBaseSalary * 100) / 100,
            totalDeductions: Math.round(totalDeductions * 100) / 100,
            totalNetSalary: Math.round(totalNetSalary * 100) / 100,
            averageNetSalary: salariesData.length > 0
                ? Math.round((totalNetSalary / salariesData.length) * 100) / 100
                : 0
        };

        res.json({
            success: true,
            month: targetMonth,
            year: targetYear,
            summary,
            data: salariesData
        });
    } catch (error) {
        console.error('Error generating salary report:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating salary report'
        });
    }
});

// @route   PUT /api/salary/update/:employeeId
// @desc    Update employee salary details (HR only)
// @access  Private (HR/Admin)
router.put('/update/:employeeId', verifyToken, isHROrAdmin, async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { hourlyRate, baseSalaryOverride, bonuses, deductions, notes } = req.body;

        // Validate that at least one field is provided
        if (!hourlyRate && !baseSalaryOverride && !bonuses && !deductions) {
            return res.status(400).json({
                success: false,
                message: 'At least one salary component is required'
            });
        }

        const employee = await User.findById(employeeId);

        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Update hourly rate if provided
        if (hourlyRate !== undefined && hourlyRate > 0) {
            employee.salary = hourlyRate;
        }

        // Store salary adjustments in a new field (we'll need to add this to the User model)
        if (!employee.salaryAdjustments) {
            employee.salaryAdjustments = {};
        }

        if (baseSalaryOverride !== undefined) {
            employee.salaryAdjustments.baseSalaryOverride = baseSalaryOverride;
        }

        if (bonuses !== undefined) {
            employee.salaryAdjustments.bonuses = bonuses;
        }

        if (deductions !== undefined) {
            employee.salaryAdjustments.deductions = deductions;
        }

        if (notes) {
            employee.salaryAdjustments.notes = notes;
            employee.salaryAdjustments.lastUpdated = new Date();
        }

        await employee.save();

        res.json({
            success: true,
            message: 'Employee salary details updated successfully',
            data: {
                employeeId: employee._id,
                employeeName: employee.username,
                hourlyRate: employee.salary,
                adjustments: employee.salaryAdjustments
            }
        });
    } catch (error) {
        console.error('Error updating employee salary:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating employee salary'
        });
    }
});

module.exports = router;