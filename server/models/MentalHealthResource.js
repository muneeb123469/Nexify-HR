const mongoose = require('mongoose');

const mentalHealthResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['Helpline', 'Therapy', 'Crisis Support', 'Self-Help', 'Other'],
        default: 'Other'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.MentalHealthResource || mongoose.model('MentalHealthResource', mentalHealthResourceSchema);
