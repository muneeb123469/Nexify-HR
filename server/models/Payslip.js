const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    employeeEmail: {
        type: String,
        required: true
    },
    employeeId: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    month: {
        type: String,
        required: true,
        // Format: "YYYY-MM" e.g., "2024-03"
    },
    salaryDetails: {
        baseSalary: {
            type: Number,
            required: true,
            default: 0
        },
        totalHours: {
            type: Number,
            default: 0
        },
        officeHours: {
            type: Number,
            default: 0
        },
        remoteHours: {
            type: Number,
            default: 0
        },
        hourlyRate: {
            type: Number,
            default: 0
        },
        overtime: {
            type: Number,
            default: 0
        },
        bonuses: {
            type: Number,
            default: 0
        },
        deductions: {
            tax: {
                type: Number,
                default: 0
            },
            insurance: {
                type: Number,
                default: 0
            },
            other: {
                type: Number,
                default: 0
            },
            total: {
                type: Number,
                default: 0
            }
        },
        netSalary: {
            type: Number,
            required: true
        }
    },
    distributionMethod: {
        type: String,
        enum: ['email', 'portal'],
        default: 'email'
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'acknowledged', 'failed'],
        default: 'pending'
    },
    emailStatus: {
        type: String,
        enum: ['not_sent', 'success', 'failed'],
        default: 'not_sent'
    },
    sentAt: {
        type: Date
    },
    acknowledgmentStatus: {
        type: String,
        enum: ['pending', 'acknowledged'],
        default: 'pending'
    },
    acknowledgedAt: {
        type: Date
    },
    errorMessage: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
payslipSchema.index({ employee: 1, month: 1 });
payslipSchema.index({ month: 1, status: 1 });
payslipSchema.index({ employeeEmail: 1 });

module.exports = mongoose.model('Payslip', payslipSchema);
