const mongoose = require('mongoose');

const wellbeingTipSchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        unique: true
    },
    tip: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to update updatedAt
wellbeingTipSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.models.WellbeingTip || mongoose.model('WellbeingTip', wellbeingTipSchema);
