const express = require("express");
const path = require("path");
const upload = require("../middleware/upload");
const { parseResume } = require("../services/cvParser");

const router = express.Router();

router.post("/parse", upload, async (req, res) => {
  const requestId = `resume_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  if (!req.file) {
    return res.status(400).json({
      message: "Resume file is required",
      requestId,
    });
  }

  try {
    const parsed = await parseResume(req.file.path);

    return res.json({
      message: "Resume parsed successfully",
      requestId,
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: req.file.path.replace(/\\/g, "/"),
        size: req.file.size,
        mimetype: req.file.mimetype,
        extension: path.extname(req.file.originalname).toLowerCase(),
      },
      parsed,
    });
  } catch (error) {
    console.error(`[${requestId}] Resume parser failed:`, error.message);

    return res.status(500).json({
      message: "Resume parsing failed",
      error: error.message,
      requestId,
    });
  }
});

module.exports = router;
