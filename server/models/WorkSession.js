const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // Duration in minutes
        default: 0
    }
});

const workSessionSchema = new mongoose.Schema({
    // Employee Information
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
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

    // Session Information
    date: {
        type: Date,
        required: true,
        index: true,
        default: () => {
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },

    // Breaks
    breaks: [breakSchema],
    currentBreak: {
        type: Date // Timestamp when current break started
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'on-break', 'completed'],
        default: 'active',
        index: true
    },

    // Calculated Fields
    totalHours: {
        type: Number,
        default: 0
    },
    productiveHours: {
        type: Number,
        default: 0
    },
    totalBreakMinutes: {
        type: Number,
        default: 0
    },

    // Metadata
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
workSessionSchema.index({ employeeId: 1, date: -1 });
workSessionSchema.index({ employeeId: 1, status: 1 });
workSessionSchema.index({ date: -1, status: 1 });

// Virtual to check if session is currently active
workSessionSchema.virtual('isSessionActive').get(function () {
    return this.status === 'active' || this.status === 'on-break';
});

// Method to calculate total hours and productive hours
workSessionSchema.methods.calculateHours = function () {
    if (!this.startTime || !this.endTime) {
        return { totalHours: 0, productiveHours: 0 };
    }

    const totalMinutes = (this.endTime - this.startTime) / (1000 * 60);
    const breakMinutes = this.breaks.reduce((total, b) => total + (b.duration || 0), 0);
    const productiveMinutes = totalMinutes - breakMinutes;

    this.totalHours = parseFloat((totalMinutes / 60).toFixed(2));
    this.productiveHours = parseFloat((productiveMinutes / 60).toFixed(2));
    this.totalBreakMinutes = breakMinutes;

    return {
        totalHours: this.totalHours,
        productiveHours: this.productiveHours
    };
};

// Method to start a break
workSessionSchema.methods.startBreak = function () {
    if (this.currentBreak) {
        throw new Error('A break is already in progress');
    }
    if (this.status === 'completed') {
        throw new Error('Cannot start break on completed session');
    }

    this.currentBreak = new Date();
    this.status = 'on-break';
    return this.save();
};

// Method to end a break
workSessionSchema.methods.endBreak = function () {
    if (!this.currentBreak) {
        throw new Error('No active break to end');
    }

    const breakEnd = new Date();
    const breakDuration = Math.round((breakEnd - this.currentBreak) / (1000 * 60));

    if (breakDuration < 1) {
        throw new Error('Break duration must be at least 1 minute');
    }

    this.breaks.push({
        startTime: this.currentBreak,
        endTime: breakEnd,
        duration: breakDuration
    });

    this.currentBreak = null;
    this.status = 'active';
    this.totalBreakMinutes = this.breaks.reduce((total, b) => total + b.duration, 0);

    return this.save();
};

// Method to end session
workSessionSchema.methods.endSession = function () {
    if (this.currentBreak) {
        throw new Error('Cannot end session while on break. Please end the break first.');
    }

    this.endTime = new Date();
    this.status = 'completed';
    this.calculateHours();

    return this.save();
};

// Static method to get active session for employee
workSessionSchema.statics.getActiveSession = function (employeeId) {
    return this.findOne({
        employeeId,
        status: { $in: ['active', 'on-break'] },
        isActive: true
    });
};

// Static method to get sessions by employee with filters
workSessionSchema.statics.getEmployeeSessions = function (employeeId, filters = {}) {
    const query = { employeeId, isActive: true };

    if (filters.startDate && filters.endDate) {
        query.date = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    } else if (filters.date) {
        const date = new Date(filters.date);
        query.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    if (filters.status) {
        query.status = filters.status;
    }

    return this.find(query).sort({ date: -1, startTime: -1 });
};

// Static method to get all sessions (for HR/Admin)
workSessionSchema.statics.getAllSessions = function (filters = {}) {
    const query = { isActive: true };

    if (filters.employeeId) {
        query.employeeId = filters.employeeId;
    }

    if (filters.department) {
        query.department = filters.department;
    }

    if (filters.startDate && filters.endDate) {
        query.date = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    } else if (filters.date) {
        const date = new Date(filters.date);
        query.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    if (filters.status) {
        query.status = filters.status;
    }

    return this.find(query)
        .populate('employeeId', 'username email department')
        .sort({ date: -1, startTime: -1 });
};

const WorkSession = mongoose.model('WorkSession', workSessionSchema);

module.exports = WorkSession;
