const express = require('express');
const router = express.Router();
const WellbeingTip = require('../models/WellbeingTip');
const MentalHealthResource = require('../models/MentalHealthResource');
const EmployeeFeedback = require('../models/EmployeeFeedback');
const ComplianceGuideline = require('../models/ComplianceGuideline');
const { auth } = require('../middleware/auth');

// ===== WELLBEING TIPS ROUTES =====

// GET - Get tip for today
router.get('/tips/today', async (req, res) => {
    try {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];

        let tip = await WellbeingTip.findOne({ dayOfWeek: today });

        // If no tip found for today, return a default tip
        if (!tip) {
            tip = {
                dayOfWeek: today,
                tip: 'Take a 5-minute break to stretch and breathe deeply. Your well-being matters!',
                updatedAt: new Date()
            };
        }

        res.json(tip);
    } catch (error) {
        console.error('Error fetching tip:', error);
        res.status(500).json({ message: 'Server error fetching tip' });
    }
});

// GET - Get all tips (HR only)
router.get('/tips', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const tips = await WellbeingTip.find().sort({ dayOfWeek: 1 });
        res.json(tips);
    } catch (error) {
        console.error('Error fetching tips:', error);
        res.status(500).json({ message: 'Server error fetching tips' });
    }
});

// PUT - Update tip for a specific day (HR only)
router.put('/tips/:dayOfWeek', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const { dayOfWeek } = req.params;
        const { tip } = req.body;

        if (!tip) {
            return res.status(400).json({ message: 'Tip content is required' });
        }

        let wellbeingTip = await WellbeingTip.findOne({ dayOfWeek });

        if (wellbeingTip) {
            wellbeingTip.tip = tip;
            wellbeingTip.createdBy = req.user.id;
            wellbeingTip.updatedAt = new Date();
            await wellbeingTip.save();
        } else {
            wellbeingTip = new WellbeingTip({
                dayOfWeek,
                tip,
                createdBy: req.user.id
            });
            await wellbeingTip.save();
        }

        res.json({ message: 'Tip updated successfully', tip: wellbeingTip });
    } catch (error) {
        console.error('Error updating tip:', error);
        res.status(500).json({ message: 'Server error updating tip' });
    }
});

// ===== MENTAL HEALTH RESOURCES ROUTES =====

// GET - Get all active mental health resources
router.get('/mental-health-resources', async (req, res) => {
    try {
        const resources = await MentalHealthResource.find({ isActive: true }).sort({ category: 1 });
        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Server error fetching resources' });
    }
});

// GET - Get all mental health resources including inactive (HR only)
router.get('/mental-health-resources/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const resources = await MentalHealthResource.find().sort({ category: 1, createdAt: -1 });
        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Server error fetching resources' });
    }
});

// POST - Create new mental health resource (HR only)
router.post('/mental-health-resources', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const { title, description, url, phoneNumber, category } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const resource = new MentalHealthResource({
            title,
            description,
            url,
            phoneNumber,
            category,
            createdBy: req.user.id
        });

        await resource.save();
        res.status(201).json({ message: 'Resource created successfully', resource });
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ message: 'Server error creating resource' });
    }
});

// PUT - Update mental health resource (HR only)
router.put('/mental-health-resources/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const { title, description, url, phoneNumber, category, isActive } = req.body;

        const resource = await MentalHealthResource.findByIdAndUpdate(
            req.params.id,
            { title, description, url, phoneNumber, category, isActive },
            { new: true, runValidators: true }
        );

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json({ message: 'Resource updated successfully', resource });
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ message: 'Server error updating resource' });
    }
});

// DELETE - Delete mental health resource (HR only)
router.delete('/mental-health-resources/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const resource = await MentalHealthResource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ message: 'Server error deleting resource' });
    }
});

// ===== EMPLOYEE FEEDBACK ROUTES =====

// POST - Submit employee feedback
router.post('/feedback', auth, async (req, res) => {
    try {
        const { feedback, category, isAnonymous } = req.body;

        if (!feedback) {
            return res.status(400).json({ message: 'Feedback content is required' });
        }

        const employeeFeedback = new EmployeeFeedback({
            employeeId: req.user.id,
            employeeName: isAnonymous ? 'Anonymous' : req.user.username,
            feedback,
            category,
            isAnonymous: isAnonymous || false
        });

        await employeeFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully', feedback: employeeFeedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Server error submitting feedback' });
    }
});

// GET - Get all employee feedback (HR only)
router.get('/feedback', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const feedback = await EmployeeFeedback.find()
            .populate('employeeId', 'username email')
            .populate('reviewedBy', 'username')
            .sort({ submittedAt: -1 });

        res.json(feedback);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Server error fetching feedback' });
    }
});

// PUT - Update feedback status (HR only)
router.put('/feedback/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const { status, reviewNotes } = req.body;

        const feedback = await EmployeeFeedback.findByIdAndUpdate(
            req.params.id,
            {
                status,
                reviewNotes,
                reviewedBy: req.user.id
            },
            { new: true, runValidators: true }
        );

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.json({ message: 'Feedback updated successfully', feedback });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ message: 'Server error updating feedback' });
    }
});

// ===== COMPLIANCE GUIDELINES ROUTES =====

// GET - Get all active compliance guidelines
router.get('/compliance-guidelines', async (req, res) => {
    try {
        const guidelines = await ComplianceGuideline.find({ isActive: true })
            .sort({ displayOrder: 1, createdAt: -1 });
        res.json(guidelines);
    } catch (error) {
        console.error('Error fetching guidelines:', error);
        res.status(500).json({ message: 'Server error fetching guidelines' });
    }
});

// GET - Get all compliance guidelines including inactive (HR only)
router.get('/compliance-guidelines/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const guidelines = await ComplianceGuideline.find()
            .sort({ displayOrder: 1, createdAt: -1 });
        res.json(guidelines);
    } catch (error) {
        console.error('Error fetching guidelines:', error);
        res.status(500).json({ message: 'Server error fetching guidelines' });
    }
});

// POST - Create new compliance guideline (HR only)
router.post('/compliance-guidelines', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const { title, content, category, displayOrder } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const guideline = new ComplianceGuideline({
            title,
            content,
            category,
            displayOrder: displayOrder || 0,
            updatedBy: req.user.id
        });

        await guideline.save();
        res.status(201).json({ message: 'Guideline created successfully', guideline });
    } catch (error) {
        console.error('Error creating guideline:', error);
        res.status(500).json({ message: 'Server error creating guideline' });
    }
});

// PUT - Update compliance guideline (HR only)
router.put('/compliance-guidelines/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const { title, content, category, displayOrder, isActive } = req.body;

        const guideline = await ComplianceGuideline.findByIdAndUpdate(
            req.params.id,
            {
                title,
                content,
                category,
                displayOrder,
                isActive,
                updatedBy: req.user.id
            },
            { new: true, runValidators: true }
        );

        if (!guideline) {
            return res.status(404).json({ message: 'Guideline not found' });
        }

        res.json({ message: 'Guideline updated successfully', guideline });
    } catch (error) {
        console.error('Error updating guideline:', error);
        res.status(500).json({ message: 'Server error updating guideline' });
    }
});

// DELETE - Delete compliance guideline (HR only)
router.delete('/compliance-guidelines/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hr') {
            return res.status(403).json({ message: 'Access denied. HR role required.' });
        }

        const guideline = await ComplianceGuideline.findByIdAndDelete(req.params.id);

        if (!guideline) {
            return res.status(404).json({ message: 'Guideline not found' });
        }

        res.json({ message: 'Guideline deleted successfully' });
    } catch (error) {
        console.error('Error deleting guideline:', error);
        res.status(500).json({ message: 'Server error deleting guideline' });
    }
});

module.exports = router;
