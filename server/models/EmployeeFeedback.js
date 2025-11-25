const mongoose = require('mongoose');

const employeeFeedbackSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeName: {
        type: String,
        trim: true
    },
    feedback: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Wellness Program', 'Workplace Safety', 'Compliance', 'General', 'Other'],
        default: 'General'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['New', 'Reviewed', 'In Progress', 'Resolved'],
        default: 'New'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewNotes: {
        type: String,
        trim: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.EmployeeFeedback || mongoose.model('EmployeeFeedback', employeeFeedbackSchema);
