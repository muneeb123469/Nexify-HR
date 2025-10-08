const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
    employeeId: {
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
    department: {
        type: String,
        required: true
    },
    leaveType: {
        type: String,
        enum: ['casual', 'sick', 'annual', 'maternity', 'paternity'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    attachments: {
        type: String, // File path for uploaded documents
        default: null
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedDate: {
        type: Date,
        default: null
    },
    reviewComments: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient queries
leaveApplicationSchema.index({ employeeId: 1 });
leaveApplicationSchema.index({ status: 1 });
leaveApplicationSchema.index({ startDate: 1, endDate: 1 });

// Validation for date range
leaveApplicationSchema.pre('save', function (next) {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        return next(new Error('End date must be after start date'));
    }
    next();
});

// Method to calculate leave duration in days
leaveApplicationSchema.methods.calculateDuration = function () {
    if (!this.startDate || !this.endDate) return 0;

    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    return daysDiff;
};

// Virtual for formatted duration
leaveApplicationSchema.virtual('duration').get(function () {
    return this.calculateDuration();
});

// Ensure virtual fields are serialized
leaveApplicationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);