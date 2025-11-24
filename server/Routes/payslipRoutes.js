const express = require('express');
const router = express.Router();
const Payslip = require('../models/Payslip');
const User = require('../models/User');
const { sendPayslipEmail } = require('../services/emailService');

// GET /api/payslips - Get all payslips with filters
router.get('/', async (req, res) => {
    try {
        const { month, status, employeeId, search } = req.query;

        let query = {};

        // Filter by month if provided
        if (month) {
            query.month = month;
        }

        // Filter by status if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        // Filter by employee if provided
        if (employeeId) {
            query.employee = employeeId;
        }

        // Search functionality
        if (search) {
            query.$or = [
                { employeeName: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        const payslips = await Payslip.find(query)
            .populate('employee', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payslips.length,
            payslips
        });

    } catch (error) {
        console.error('Error fetching payslips:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payslips',
            error: error.message
        });
    }
});

// GET /api/payslips/periods - Get available periods (months with approved salaries)
router.get('/periods', async (req, res) => {
    try {
        // Get distinct months from existing payslips
        const periods = await Payslip.distinct('month');

        // Sort periods in descending order (most recent first)
        const sortedPeriods = periods.sort((a, b) => {
            return new Date(b + '-01') - new Date(a + '-01');
        });

        // Format periods for display
        const formattedPeriods = sortedPeriods.map(period => {
            const date = new Date(period + '-01');
            return {
                value: period,
                label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };
        });

        res.status(200).json({
            success: true,
            periods: formattedPeriods
        });

    } catch (error) {
        console.error('Error fetching periods:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch periods',
            error: error.message
        });
    }
});

// POST /api/payslips/generate - Generate payslips from approved salaries
router.post('/generate', async (req, res) => {
    try {
        const { month, employees } = req.body;

        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Month is required'
            });
        }

        if (!employees || !Array.isArray(employees) || employees.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Employee salary data is required'
            });
        }

        const generatedPayslips = [];
        const errors = [];

        for (const empData of employees) {
            try {
                // Check if payslip already exists for this employee and month
                const existingPayslip = await Payslip.findOne({
                    employee: empData.employeeId,
                    month: month
                });

                if (existingPayslip) {
                    errors.push({
                        employeeId: empData.employeeId,
                        message: 'Payslip already exists for this period'
                    });
                    continue;
                }

                // Create new payslip
                const payslip = new Payslip({
                    employee: empData.employeeId,
                    employeeName: empData.employeeName || empData.name,
                    employeeEmail: empData.employeeEmail || empData.email,
                    employeeId: empData.id || empData.employeeId,
                    position: empData.position,
                    month: month,
                    salaryDetails: {
                        baseSalary: empData.salaryData?.baseSalary || 0,
                        totalHours: empData.workingHours || 0,
                        officeHours: empData.attendanceHours || 0,
                        remoteHours: empData.remoteHours || 0,
                        hourlyRate: empData.hourlyRate || 0,
                        overtime: empData.salaryData?.overtime || 0,
                        bonuses: empData.salaryData?.bonuses || 0,
                        deductions: {
                            tax: empData.salaryData?.deductions?.tax || 0,
                            insurance: empData.salaryData?.deductions?.insurance || 0,
                            other: empData.salaryData?.deductions?.other || 0,
                            total: empData.salaryData?.deductions || 0
                        },
                        netSalary: empData.salaryData?.netSalary || 0
                    },
                    distributionMethod: empData.distributionMethod || 'email',
                    status: 'pending'
                });

                await payslip.save();
                generatedPayslips.push(payslip);

            } catch (error) {
                errors.push({
                    employeeId: empData.employeeId || empData.id,
                    message: error.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: `Generated ${generatedPayslips.length} payslips`,
            count: generatedPayslips.length,
            payslips: generatedPayslips,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error generating payslips:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate payslips',
            error: error.message
        });
    }
});

// POST /api/payslips/send/:payslipId - Send individual payslip via email
router.post('/send/:payslipId', async (req, res) => {
    try {
        const { payslipId } = req.params;

        const payslip = await Payslip.findById(payslipId);

        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        // Send email
        const emailResult = await sendPayslipEmail(payslip);

        // Update payslip status
        payslip.status = emailResult.success ? 'sent' : 'failed';
        payslip.emailStatus = emailResult.success ? 'success' : 'failed';
        payslip.sentAt = emailResult.success ? new Date() : payslip.sentAt;
        payslip.errorMessage = emailResult.success ? null : emailResult.error;

        await payslip.save();

        if (emailResult.success) {
            res.status(200).json({
                success: true,
                message: 'Payslip sent successfully',
                payslip
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send payslip',
                error: emailResult.error,
                payslip
            });
        }

    } catch (error) {
        console.error('Error sending payslip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send payslip',
            error: error.message
        });
    }
});

// POST /api/payslips/send-bulk - Send all pending payslips for a period
router.post('/send-bulk', async (req, res) => {
    try {
        const { month, payslipIds } = req.body;

        let query = {};

        if (payslipIds && Array.isArray(payslipIds) && payslipIds.length > 0) {
            query._id = { $in: payslipIds };
        } else if (month) {
            query.month = month;
            query.status = 'pending';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either month or payslipIds is required'
            });
        }

        const payslips = await Payslip.find(query);

        if (payslips.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No payslips found to send'
            });
        }

        const results = {
            success: [],
            failed: []
        };

        // Send emails to all payslips
        for (const payslip of payslips) {
            try {
                const emailResult = await sendPayslipEmail(payslip);

                // Update payslip status
                payslip.status = emailResult.success ? 'sent' : 'failed';
                payslip.emailStatus = emailResult.success ? 'success' : 'failed';
                payslip.sentAt = emailResult.success ? new Date() : payslip.sentAt;
                payslip.errorMessage = emailResult.success ? null : emailResult.error;

                await payslip.save();

                if (emailResult.success) {
                    results.success.push({
                        payslipId: payslip._id,
                        employeeName: payslip.employeeName,
                        email: payslip.employeeEmail
                    });
                } else {
                    results.failed.push({
                        payslipId: payslip._id,
                        employeeName: payslip.employeeName,
                        email: payslip.employeeEmail,
                        error: emailResult.error
                    });
                }

            } catch (error) {
                results.failed.push({
                    payslipId: payslip._id,
                    employeeName: payslip.employeeName,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Sent ${results.success.length} of ${payslips.length} payslips`,
            totalProcessed: payslips.length,
            successCount: results.success.length,
            failedCount: results.failed.length,
            results
        });

    } catch (error) {
        console.error('Error sending bulk payslips:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send payslips',
            error: error.message
        });
    }
});

// POST /api/payslips/resend/:payslipId - Resend a payslip
router.post('/resend/:payslipId', async (req, res) => {
    try {
        const { payslipId } = req.params;

        const payslip = await Payslip.findById(payslipId);

        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        // Send email
        const emailResult = await sendPayslipEmail(payslip);

        // Update payslip status
        payslip.emailStatus = emailResult.success ? 'success' : 'failed';
        payslip.sentAt = new Date();
        payslip.errorMessage = emailResult.success ? null : emailResult.error;

        await payslip.save();

        if (emailResult.success) {
            res.status(200).json({
                success: true,
                message: 'Payslip re-sent successfully',
                payslip
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to re-send payslip',
                error: emailResult.error
            });
        }

    } catch (error) {
        console.error('Error resending payslip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend payslip',
            error: error.message
        });
    }
});

// GET /api/payslips/:payslipId - Get single payslip
router.get('/:payslipId', async (req, res) => {
    try {
        const { payslipId } = req.params;

        const payslip = await Payslip.findById(payslipId).populate('employee', 'name email');

        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        res.status(200).json({
            success: true,
            payslip
        });

    } catch (error) {
        console.error('Error fetching payslip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payslip',
            error: error.message
        });
    }
});

// DELETE /api/payslips/:payslipId - Delete a payslip
router.delete('/:payslipId', async (req, res) => {
    try {
        const { payslipId } = req.params;

        const payslip = await Payslip.findByIdAndDelete(payslipId);

        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payslip deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting payslip:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete payslip',
            error: error.message
        });
    }
});

module.exports = router;
