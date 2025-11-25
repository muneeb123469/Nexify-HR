// server/Routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { parseResume } = require('../services/cvParser');
const upload = require('../middleware/upload'); // Enhanced upload middleware
const { validateApplicationRequest } = require('../utils/validation');
const { auth } = require('../middleware/auth'); // Authentication middleware
const { sendOfferEmail } = require('../services/emailService');

// NEW: helper to write a JSON file beside the uploaded resume
async function writeParseJson(file, payload, requestId = 'no_reqid') {
  if (!file || !file.path) return; // nothing to write
  try {
    const dir = path.dirname(file.path);
    const base = path.parse(file.path).name; // e.g., resume-... (without .pdf/.docx)
    const jsonPath = path.join(dir, `${base}.json`);
    await fs.promises.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[${requestId}] Saved parse JSON: ${jsonPath}`);
  } catch (e) {
    console.error(
      `[${requestId}] Failed to write parse JSON: ${e.message}`
    );
  }
}

// -----------------------
// NEW: Fetch user's applications (for applicant dashboard)
// -----------------------
router.get('/user', auth, async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] Fetching applications for user: ${req.user.email}`);

  try {
    // Fetch only the authenticated user's applications, populated with job details
    const applications = await Application.find({ email: req.user.email })
      .populate('job', 'title company department location salary') // Populate relevant job fields
      .sort({ createdAt: -1 }) // Most recent first
      .lean(); // Optimize for JSON response

    console.log(`[${requestId}] Found ${applications.length} applications for ${req.user.email}`);

    res.json(applications);
  } catch (error) {
    console.error(`[${requestId}] Error fetching user applications:`, error);
    res.status(500).json({
      message: 'Error fetching your applications',
      requestId,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// -----------------------
// NEW: Fetch all applications (for HR dashboard)
// -----------------------
router.get('/', async (req, res) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] Fetching all applications for HR dashboard`);

  try {
    // Build query object based on filters
    const query = {};

    // Filter by candidate name (case-insensitive partial match)
    if (req.query.candidateName) {
      query.name = { $regex: req.query.candidateName, $options: 'i' };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.jobId) {
      query.job = req.query.jobId;
    }
    console.log(`[${requestId}] Query filters:`, query);
    console.log(`[${requestId}] Job title filter:`, req.query.jobTitle);

    // Fetch applications with populated job details
    let applicationsQuery = Application.find(query)
      .populate('job', 'title company department location salary status')
      .sort({ createdAt: -1 }) // Most recent first
      .lean(); // Optimize for JSON response

    const applications = await applicationsQuery;

    // Filter by job title after population (since it's in the populated job object)
    let filteredApplications = applications;
    if (req.query.jobTitle) {
      filteredApplications = applications.filter(app =>
        app.job && app.job.title &&
        app.job.title.toLowerCase().includes(req.query.jobTitle.toLowerCase())
      );
    }

    console.log(`[${requestId}] Found ${filteredApplications.length} applications (${applications.length} before job title filter)`);

    res.json(filteredApplications);
  } catch (error) {
    console.error(`[${requestId}] Error fetching applications:`, error);
    res.status(500).json({
      message: 'Error fetching applications',
      requestId,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// -----------------------
// Submit a new application
// -----------------------
router.post('/', auth, upload, async (req, res) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[${requestId}] Application submission started`);
  console.log(`[${requestId}] Request body:`, req.body);
  console.log(`[${requestId}] File info:`, req.file ? {
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  } : 'No file');

  try {
    const { jobId, name, email, phone, coverLetter } = req.body;

    // 1. Enhanced request validation
    console.log(`[${requestId}] Validating request data`);
    const validation = validateApplicationRequest(req.body);
    if (!validation.isValid) {
      console.log(`[${requestId}] Validation failed:`, validation.errors);

      // NEW: write error JSON if a file was uploaded
      if (req.file) {
        writeParseJson(req.file, {
          applicationId: null,
          originalName: req.file.originalname,
          storedFile: path.basename(req.file.path),
          error: 'Validation failed',
          details: validation.errors,
          _metadata: { requestId, createdAt: new Date().toISOString() }
        }, requestId);
      }

      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
        requestId
      });
    }

    // 2. Validate job exists
    console.log(`[${requestId}] Checking job exists: ${jobId}`);
    const job = await Job.findById(jobId);
    if (!job) {
      console.log(`[${requestId}] Job not found: ${jobId}`);

      // NEW: record error JSON if a file was uploaded
      if (req.file) {
        writeParseJson(req.file, {
          applicationId: null,
          originalName: req.file.originalname,
          storedFile: path.basename(req.file.path),
          error: 'Job not found',
          _metadata: { requestId, createdAt: new Date().toISOString() }
        }, requestId);
      }

      return res.status(404).json({
        message: 'Job not found',
        requestId
      });
    }
    console.log(`[${requestId}] Job found: ${job.title}`);

    // 3. Validate resume file
    if (!req.file) {
      console.log(`[${requestId}] No resume file uploaded`);
      return res.status(400).json({
        message: 'Resume file is required',
        requestId
      });
    }

    // 4. Check for duplicate application
    console.log(`[${requestId}] Checking for existing application`);
    const existingApplication = await Application.findOne({
      job: jobId,
      email: email
    });
    if (existingApplication) {
      console.log(`[${requestId}] Duplicate application found for email: ${email}`);

      // NEW: store an error JSON next to this upload indicating duplicate
      writeParseJson(req.file, {
        applicationId: existingApplication._id?.toString?.() || null,
        originalName: req.file.originalname,
        storedFile: path.basename(req.file.path),
        error: 'Duplicate application for this job and email',
        _metadata: { requestId, createdAt: new Date().toISOString() }
      }, requestId);

      return res.status(400).json({
        message: 'You have already applied for this job',
        requestId
      });
    }

    // 5. Create the base application
    console.log(`[${requestId}] Creating application record`);
    let app = await Application.create({
      job: job._id,
      name,
      email,
      phone,
      coverLetter,
      resume: req.file.path.replace(/\\/g, '/'),
      status: 'pending'
    });
    console.log(`[${requestId}] Application created with ID: ${app._id}`);

    // 6. Parse resume with enhanced error handling
    let parseSuccess = false;
    let parseError = null;

    console.log(`[${requestId}] Starting resume parsing for file: ${req.file.path}`);

    try {
      const parseStartTime = Date.now();
      const parsed = await parseResume(req.file.path);
      const parseEndTime = Date.now();

      console.log(`[${requestId}] Resume parsing completed in ${parseEndTime - parseStartTime}ms`);
      console.log(`[${requestId}] Parsed data summary:`, {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        skillsCount: parsed.skills?.length || 0,
        educationCount: parsed.education?.length || 0,
        experienceCount: parsed.experience?.length || 0,
        confidence: parsed.confidence
      });

      // Update application with parsed data
      app.parsedResume = {
        ...parsed,
        parsedAt: new Date()
      };
      await app.save();

      // Write success JSON sidecar
      writeParseJson(req.file, {
        applicationId: app._id?.toString?.() || null,
        originalName: req.file.originalname,
        storedFile: path.basename(req.file.path),
        parsed: parsed,
        confidence: parsed.confidence,
        _metadata: { requestId, createdAt: new Date().toISOString() }
      }, requestId);

      parseSuccess = true;
    } catch (parseErr) {
      console.error(`[${requestId}] Resume parsing failed:`, parseErr);
      parseError = parseErr.message;

      // Write error JSON sidecar even on parse failure
      writeParseJson(req.file, {
        applicationId: app._id?.toString?.() || null,
        originalName: req.file.originalname,
        storedFile: path.basename(req.file.path),
        error: 'Resume parsing failed',
        parseError: parseErr.message,
        confidence: 0,
        _metadata: { requestId, createdAt: new Date().toISOString() }
      }, requestId);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`[${requestId}] Application submission completed in ${totalTime}ms`);
    console.log(`[${requestId}] Parse success: ${parseSuccess}, error: ${parseError || 'none'}`);

    // Return the application with populated job data
    const populatedApp = await Application.findById(app._id)
      .populate('job', 'title company department location salary');

    const response = {
      ...populatedApp.toObject(),
      _metadata: {
        requestId,
        processingTime: totalTime,
        parseSuccess,
        parseError
      }
    };

    res.status(201).json(response);

  } catch (err) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.error(`[${requestId}] Application submission error after ${totalTime}ms:`, err);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log(`[${requestId}] Cleaned up failed upload: ${req.file.path}`);
    }

    res.status(500).json({
      message: 'Error submitting application',
      error: err.message,
      requestId,
      processingTime: totalTime
    });
  }
});

// Download resume file
router.get('/download-resume/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!application.resume) {
      return res.status(404).json({ message: 'Resume file not found for this application' });
    }

    // Construct the full file path
    const filePath = path.join(__dirname, '..', application.resume);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file does not exist on server' });
    }

    // Get file stats for proper headers
    const stats = fs.statSync(filePath);
    const fileName = path.basename(application.resume);
    const fileExtension = path.extname(fileName).toLowerCase();

    // Set appropriate content type based on file extension
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Set headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (error) => {
      console.error('Error reading file:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error reading file' });
      }
    });

    fileStream.pipe(res);

    console.log(`Resume downloaded: ${fileName} for application ${applicationId}`);

  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// -----------------------
// Get single application by ID
// -----------------------
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[${requestId}] Get application request started for ID: ${req.params.id}`);

  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company department location salary');

    if (!application) {
      console.log(`[${requestId}] Application not found: ${req.params.id}`);
      return res.status(404).json({
        message: 'Application not found',
        requestId
      });
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`[${requestId}] Application retrieved successfully in ${totalTime}ms`);

    res.json({
      ...application.toObject(),
      _metadata: {
        requestId,
        processingTime: totalTime
      }
    });

  } catch (err) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.error(`[${requestId}] Get application error after ${totalTime}ms:`, err.message);

    res.status(500).json({
      message: 'Error retrieving application',
      error: err.message,
      requestId,
      processingTime: totalTime
    });
  }
});

// -----------------------
// Reparse resume for an existing application
// -----------------------
router.post('/:id/reparse', async (req, res) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[${requestId}] Reparse request started for application: ${req.params.id}`);

  try {
    // 1. Find and validate application
    const app = await Application.findById(req.params.id);
    if (!app) {
      console.log(`[${requestId}] Application not found: ${req.params.id}`);
      return res.status(404).json({
        message: 'Application not found',
        requestId
      });
    }

    if (!app.resume) {
      console.log(`[${requestId}] No resume file associated with application: ${req.params.id}`);
      return res.status(400).json({
        message: 'No resume file to parse',
        requestId
      });
    }

    console.log(`[${requestId}] Found application with resume: ${app.resume}`);

    // 2. Validate file still exists
    const fs = require('fs');
    if (!fs.existsSync(app.resume)) {
      console.log(`[${requestId}] Resume file no longer exists: ${app.resume}`);
      return res.status(400).json({
        message: 'Resume file no longer exists on server',
        requestId
      });
    }

    // 3. Perform reparse
    console.log(`[${requestId}] Starting reparse of: ${app.resume}`);
    const parseStartTime = Date.now();

    const parsed = await parseResume(app.resume);

    const parseEndTime = Date.now();
    console.log(`[${requestId}] Reparse completed in ${parseEndTime - parseStartTime}ms`);
    console.log(`[${requestId}] Reparsed data summary:`, {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      skillsCount: parsed.skills?.length || 0,
      educationCount: parsed.education?.length || 0,
      experienceCount: parsed.experience?.length || 0,
      confidence: parsed.confidence
    });

    // 4. Update application
    app.parsedResume = {
      ...parsed,
      parsedAt: new Date(parsed.parsedAt || Date.now()),
    };
    await app.save();

    // NEW: drop a fresh sidecar json for the reparse result
    try {
      const fakeReqFile = { path: app.resume, originalname: path.basename(app.resume) };
      writeParseJson(fakeReqFile, {
        applicationId: app._id?.toString?.() || null,
        originalName: fakeReqFile.originalname,
        storedFile: path.basename(app.resume),
        parsed,
        _metadata: { requestId, createdAt: new Date().toISOString(), action: 'reparse' }
      }, requestId);
    } catch (_) { /* ignore */ }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`[${requestId}] Reparse completed successfully in ${totalTime}ms`);

    // 5. Return updated application with populated job data
    const updatedApp = await Application.findById(app._id)
      .populate('job', 'title company department location salary');

    const response = {
      ...updatedApp.toObject(),
      _metadata: {
        requestId,
        processingTime: totalTime,
        reparseSuccess: true
      }
    };

    res.json(response);

  } catch (err) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.error(`[${requestId}] Reparse error after ${totalTime}ms:`, err.message);
    console.error(`[${requestId}] Error stack:`, err.stack);

    res.status(500).json({
      message: 'Error reparsing resume',
      error: err.message,
      requestId,
      processingTime: totalTime
    });
  }
});

// -----------------------
// Update application status
// -----------------------
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('job', 'title company department location salary');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// -----------------------
// Generate and send offer letter, persist details
// -----------------------
router.post('/:id/offer', async (req, res) => {
  try {
    const { salary, startDate, benefits = [], additionalNotes = '' } = req.body || {};

    if (!salary || !startDate) {
      return res.status(400).json({ message: 'Salary and start date are required' });
    }

    const application = await Application.findById(req.params.id).populate('job', 'title department');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Save offer details
    application.offerDetails = {
      salary,
      startDate,
      benefits,
      additionalNotes,
      generatedAt: application.offerDetails?.generatedAt || new Date(),
      sentAt: new Date()
    };
    application.offerStatus = 'sent';
    await application.save();

    // Send offer-letter email with dedicated template
    let emailResult;
    try {
      emailResult = await sendOfferEmail({
        candidateName: application.name,
        candidateEmail: application.email,
        position: application.job?.title || 'Position',
        salary,
        startDate,
        benefits,
        additionalNotes
      });
    } catch (e) {
      emailResult = { success: false, error: e.message };
    }

    res.json({
      message: 'Offer saved' + (emailResult.success ? ' and email sent' : ' (email failed)'),
      application
    });
  } catch (error) {
    console.error('Error sending offer:', error);
    res.status(500).json({ message: 'Failed to send offer', error: error.message });
  }
});

// -----------------------
// Cancel/Withdraw application (for applicants)
// -----------------------
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if the user owns this application
    if (application.email !== req.user.email) {
      return res.status(403).json({ message: 'You can only cancel your own applications' });
    }

    // Check if application can be cancelled
    if (['rejected', 'hired', 'cancelled'].includes(application.status.toLowerCase())) {
      return res.status(400).json({ message: 'This application cannot be cancelled' });
    }

    // Update status to cancelled
    application.status = 'cancelled';
    await application.save();

    const updatedApp = await Application.findById(application._id)
      .populate('job', 'title company department location salary');

    res.json(updatedApp);
  } catch (error) {
    console.error('Error cancelling application:', error);
    res.status(500).json({ message: 'Error cancelling application', error: error.message });
  }
});

// -----------------------
// Delete application
// -----------------------
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Parser status endpoint
router.get('/parser/status', (req, res) => {
  res.json({
    status: 'ready',
    message: 'Parser is ready to process resumes',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;