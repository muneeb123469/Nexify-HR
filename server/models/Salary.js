const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    baseSalary: {
        type: Number,
        required: true,
        default: 0
    },
    bonuses: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        required: true,
        default: 0
    },
    workHours: {
        attendanceHours: { type: Number, default: 0 },
        remoteHours: { type: Number, default: 0 },
        totalHours: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Create compound index for employee, month, and year
salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
