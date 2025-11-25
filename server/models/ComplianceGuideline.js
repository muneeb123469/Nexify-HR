const mongoose = require('mongoose');

const complianceGuidelineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Workplace Safety', 'Anti-Discrimination', 'Harassment Policy', 'General Compliance', 'Other'],
        default: 'General Compliance'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.ComplianceGuideline || mongoose.model('ComplianceGuideline', complianceGuidelineSchema);
