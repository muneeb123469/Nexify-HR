const Application = require('../models/Application');
const Job = require('../models/Job');

// Submit a new application
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const resume = req.file ? req.file.path : null;

    if (!resume) {
      return res.status(400).json({ message: 'Resume is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    const application = new Application({
      job: jobId,
      candidate: req.user.id,
      resume,
      coverLetter
    });

    await application.save();
    return res.status(201).json(application); // return application with 201 status
  } catch (error) {
    return res.status(400).json({ message: 'Error submitting application', error: error.message });
  }
};

// Get all applications for a job (HR/Admin only)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    const filter = { job: jobId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('candidate', 'username email')
      .populate('job', 'title department');
    return res.status(200).json(applications); // return applications with 200 status
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Get applications submitted by a user
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title department location')
      .sort({ createdAt: -1 });
    return res.status(200).json(applications); // return user applications with 200 status
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Update application status (HR/Admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, note } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is authorized to update status
    const job = await Job.findById(application.job);
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status; // Update status
    if (note) {
      application.notes.push({ text: note, addedBy: req.user.id });
    }

    await application.save();
    return res.status(200).json(application); // return updated application with 200 status
  } catch (error) {
    return res.status(400).json({ message: 'Error updating application', error: error.message });
  }
};

// Get a single application
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', 'username email')
      .populate('job', 'title department')
      .populate('notes.addedBy', 'username');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is authorized to view
    const job = await Job.findById(application.job);
    if (application.candidate._id.toString() !== req.user.id && 
        job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this application' });
    }

    return res.status(200).json(application); // return application with 200 status
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching application', error: error.message });
  }
};
