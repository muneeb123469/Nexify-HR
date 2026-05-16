// server/Routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const { parseResume } = require("../services/cvParser");
const upload = require("../middleware/upload"); // Enhanced upload middleware
const { validateApplicationRequest } = require("../utils/validation");
const { auth, authorize } = require("../middleware/auth");

// NEW: for writing the sidecar JSON next to the uploaded file
const fs = require("fs");
const path = require("path");

const ALLOWED_APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
];

function formatApplication(app) {
  return {
    _id: app._id,
    jobTitle: app.job?.title || app.jobTitle || "Unknown Job",
    company: app.company || "Nexify HR",
    department: app.job?.department || app.jobDepartment || "N/A",
    location: app.job?.location || app.jobLocation || "N/A",
    applicantName: app.name,
    email: app.email,
    phone: app.phone,
    coverLetter: app.coverLetter,
    resume: app.resume,
    status: app.status,
    appliedDate: app.createdAt
      ? new Date(app.createdAt).toLocaleDateString()
      : "N/A",
    lastUpdated: app.createdAt
      ? new Date(app.createdAt).toLocaleDateString()
      : "N/A",
  };
}

// NEW: helper to write a JSON file beside the uploaded resume
async function writeParseJson(file, payload, requestId = "no_reqid") {
  if (!file || !file.path) return; // nothing to write
  try {
    const dir = path.dirname(file.path);
    const base = path.parse(file.path).name; // e.g., resume-... (without .pdf/.docx)
    const jsonPath = path.join(dir, `${base}.json`);
    await fs.promises.writeFile(
      jsonPath,
      JSON.stringify(payload, null, 2),
      "utf8",
    );
    console.log(`[${requestId}] Saved parse JSON: ${jsonPath}`);
  } catch (e) {
    console.error(`[${requestId}] Failed to write parse JSON: ${e.message}`);
  }
}

// -----------------------
// Submit a new application
// -----------------------
router.post("/", upload, async (req, res) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`[${requestId}] Application submission started`);
  console.log(`[${requestId}] Request body:`, req.body);
  console.log(
    `[${requestId}] File info:`,
    req.file
      ? {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path,
        }
      : "No file",
  );

  try {
    const { jobId, name, email, phone, coverLetter } = req.body;

    // 1. Enhanced request validation
    console.log(`[${requestId}] Validating request data`);
    const validation = validateApplicationRequest(req.body);
    if (!validation.isValid) {
      console.log(`[${requestId}] Validation failed:`, validation.errors);

      // NEW: write error JSON if a file was uploaded
      if (req.file) {
        writeParseJson(
          req.file,
          {
            applicationId: null,
            originalName: req.file.originalname,
            storedFile: path.basename(req.file.path),
            error: "Validation failed",
            details: validation.errors,
            _metadata: { requestId, createdAt: new Date().toISOString() },
          },
          requestId,
        );
      }

      return res.status(400).json({
        message: "Validation failed",
        errors: validation.errors,
        requestId,
      });
    }

    // 2. Validate job exists
    console.log(`[${requestId}] Checking job exists: ${jobId}`);
    const job = await Job.findById(jobId);
    if (!job) {
      console.log(`[${requestId}] Job not found: ${jobId}`);

      // NEW: record error JSON if a file was uploaded
      if (req.file) {
        writeParseJson(
          req.file,
          {
            applicationId: null,
            originalName: req.file.originalname,
            storedFile: path.basename(req.file.path),
            error: "Job not found",
            _metadata: { requestId, createdAt: new Date().toISOString() },
          },
          requestId,
        );
      }

      return res.status(404).json({
        message: "Job not found",
        requestId,
      });
    }
    console.log(`[${requestId}] Job found: ${job.title}`);

    // 3. Validate resume file
    if (!req.file) {
      console.log(`[${requestId}] No resume file uploaded`);
      return res.status(400).json({
        message: "Resume file is required",
        requestId,
      });
    }

    // 4. Check for duplicate application
    console.log(`[${requestId}] Checking for existing application`);
    const existingApplication = await Application.findOne({
      job: jobId,
      email: email,
    });
    if (existingApplication) {
      console.log(
        `[${requestId}] Duplicate application found for email: ${email}`,
      );

      // NEW: store an error JSON next to this upload indicating duplicate
      writeParseJson(
        req.file,
        {
          applicationId: existingApplication._id?.toString?.() || null,
          originalName: req.file.originalname,
          storedFile: path.basename(req.file.path),
          error: "Duplicate application for this job and email",
          _metadata: { requestId, createdAt: new Date().toISOString() },
        },
        requestId,
      );

      return res.status(400).json({
        message: "You have already applied for this job",
        requestId,
      });
    }

    // 5. Create the base application
    console.log(`[${requestId}] Creating application record`);
    let app = await Application.create({
      job: job._id,
      // Keep a job snapshot so applications remain readable after job deletion.
      jobTitle: job.title,
      jobDepartment: job.department,
      jobLocation: job.location,
      company: job.company || "Nexify HR",
      name,
      email,
      phone,
      coverLetter,
      resume: req.file.path.replace(/\\/g, "/"),
      status: "pending",
    });
    console.log(`[${requestId}] Application created with ID: ${app._id}`);

    // 6. Parse resume with enhanced error handling
    let parseSuccess = false;
    let parseError = null;

    console.log(
      `[${requestId}] Starting resume parsing for file: ${req.file.path}`,
    );

    try {
      const parseStartTime = Date.now();
      const parsed = await parseResume(req.file.path);
      const parseEndTime = Date.now();

      console.log(
        `[${requestId}] Resume parsing completed in ${parseEndTime - parseStartTime}ms`,
      );
      console.log(`[${requestId}] Parsed data summary:`, {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        skillsCount: parsed.skills?.length || 0,
        educationCount: parsed.education?.length || 0,
        experienceCount: parsed.experience?.length || 0,
        confidence: parsed.confidence,
      });

      // Update application with parsed data
      app.parsedResume = {
        ...parsed,
        parsedAt: new Date(parsed.parsedAt || Date.now()),
      };
      await app.save();
      parseSuccess = true;

      // NEW: write the parsed JSON beside the uploaded file (fire-and-forget)
      writeParseJson(
        req.file,
        {
          applicationId: app._id?.toString?.() || null,
          originalName: req.file.originalname,
          storedFile: path.basename(req.file.path),
          parsed, // full sanitized parsed result
          _metadata: { requestId, createdAt: new Date().toISOString() },
        },
        requestId,
      );

      console.log(`[${requestId}] Application updated with parsed resume data`);
    } catch (parseErr) {
      parseError = parseErr;
      console.error(`[${requestId}] Resume parsing failed:`, parseErr.message);
      console.error(`[${requestId}] Parse error stack:`, parseErr.stack);

      if (parseErr.message.includes("PyMuPDF")) {
        console.error(
          `[${requestId}] PyMuPDF dependency issue - consider running: pip install PyMuPDF`,
        );
      } else if (parseErr.message.includes("timeout")) {
        console.error(
          `[${requestId}] Parsing timeout - file may be too complex or large`,
        );
      } else if (parseErr.message.includes("JSON")) {
        console.error(
          `[${requestId}] Parser output format issue - check Python script`,
        );
      }

      // NEW: write an error JSON beside the file so you still get a sidecar
      writeParseJson(
        req.file,
        {
          applicationId: app?._id?.toString?.() || null,
          originalName: req.file.originalname,
          storedFile: path.basename(req.file.path),
          error: parseErr.message || String(parseErr),
          _metadata: { requestId, createdAt: new Date().toISOString() },
        },
        requestId,
      );

      // graceful degradation (keep existing behavior)
    }

    // 7. Prepare and return response
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(
      `[${requestId}] Application submission completed in ${totalTime}ms`,
    );
    console.log(`[${requestId}] Parse success: ${parseSuccess}`);

    // Fetch the final application data
    app = await Application.findById(app._id).lean();

    // Add metadata to response
    const response = {
      ...app,
      _metadata: {
        requestId,
        processingTime: totalTime,
        parseSuccess,
        parseError: parseError ? parseError.message : null,
      },
    };

    res.status(201).json(response);
  } catch (err) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.error(
      `[${requestId}] Application submission error after ${totalTime}ms:`,
      err.message,
    );
    console.error(`[${requestId}] Error stack:`, err.stack);

    // NEW: if there was an upload, drop an error JSON
    if (req.file) {
      writeParseJson(
        req.file,
        {
          applicationId: null,
          originalName: req.file.originalname,
          storedFile: path.basename(req.file.path),
          error: err.message || "Unhandled server error",
          _metadata: { requestId, createdAt: new Date().toISOString() },
        },
        requestId,
      );
    }

    // Return detailed error information
    res.status(500).json({
      message: "Error submitting application",
      error: err.message,
      requestId,
      processingTime: totalTime,
    });
  }
});
// -----------------------
// Get applications visible to the current user
// -----------------------
router.get("/", auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "applicant") {
      query = { email: req.user.email };
    } else if (req.user.role !== "hr" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to view applications",
      });
    }

    const applications = await Application.find(query)
      .populate("job", "title department location")
      .sort("-createdAt");

    const formattedApplications = applications.map(formatApplication);

    res.json(formattedApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// -----------------------
// Get all applications for a job
// -----------------------
router.get("/job/:jobId", async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate("job", "title")
      .sort("-createdAt");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------
// Reparse an application's resume
// -----------------------
router.post("/:id/reparse", async (req, res) => {
  const startTime = Date.now();
  const requestId = `reparse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(
    `[${requestId}] Reparse request started for application: ${req.params.id}`,
  );

  try {
    // 1. Find and validate application
    const app = await Application.findById(req.params.id);
    if (!app) {
      console.log(`[${requestId}] Application not found: ${req.params.id}`);
      return res.status(404).json({
        message: "Application not found",
        requestId,
      });
    }

    if (!app.resume) {
      console.log(
        `[${requestId}] No resume file associated with application: ${req.params.id}`,
      );
      return res.status(400).json({
        message: "No resume file to parse",
        requestId,
      });
    }

    console.log(`[${requestId}] Found application with resume: ${app.resume}`);

    // 2. Validate file still exists
    const fs = require("fs");
    if (!fs.existsSync(app.resume)) {
      console.log(`[${requestId}] Resume file no longer exists: ${app.resume}`);
      return res.status(400).json({
        message: "Resume file no longer exists on server",
        requestId,
      });
    }

    // 3. Perform reparse
    console.log(`[${requestId}] Starting reparse of: ${app.resume}`);
    const parseStartTime = Date.now();

    const parsed = await parseResume(app.resume);

    const parseEndTime = Date.now();
    console.log(
      `[${requestId}] Reparse completed in ${parseEndTime - parseStartTime}ms`,
    );
    console.log(`[${requestId}] Reparsed data summary:`, {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      skillsCount: parsed.skills?.length || 0,
      educationCount: parsed.education?.length || 0,
      experienceCount: parsed.experience?.length || 0,
      confidence: parsed.confidence,
    });

    // 4. Update application
    app.parsedResume = {
      ...parsed,
      parsedAt: new Date(parsed.parsedAt || Date.now()),
    };
    await app.save();

    // NEW: drop a fresh sidecar json for the reparse result
    try {
      const fakeReqFile = {
        path: app.resume,
        originalname: path.basename(app.resume),
      };
      writeParseJson(
        fakeReqFile,
        {
          applicationId: app._id?.toString?.() || null,
          originalName: fakeReqFile.originalname,
          storedFile: path.basename(app.resume),
          parsed,
          _metadata: {
            requestId,
            createdAt: new Date().toISOString(),
            action: "reparse",
          },
        },
        requestId,
      );
    } catch (_) {
      /* ignore */
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(
      `[${requestId}] Reparse completed successfully in ${totalTime}ms`,
    );

    // 5. Return updated application
    const response = {
      ...app.toObject(),
      _metadata: {
        requestId,
        processingTime: totalTime,
        reparseSuccess: true,
      },
    };

    res.json(response);
  } catch (err) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.error(
      `[${requestId}] Reparse error after ${totalTime}ms:`,
      err.message,
    );
    console.error(`[${requestId}] Error stack:`, err.stack);

    res.status(500).json({
      message: "Error reparsing resume",
      error: err.message,
      requestId,
      processingTime: totalTime,
    });
  }
});

// -----------------------
// Update application status
// -----------------------
router.patch("/:id/status", auth, authorize("hr", "admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!ALLOWED_APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed statuses are: ${ALLOWED_APPLICATION_STATUSES.join(", ")}`,
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// -----------------------
// Delete application
// -----------------------
router.delete("/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await application.remove();
    res.json({ message: "Application deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Parser status endpoint
router.get("/parser/status", (req, res) => {
  res.json({
    status: "ready",
    message: "Parser is ready to process resumes",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
