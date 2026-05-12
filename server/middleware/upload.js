const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists with absolute path
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, "resume-" + uniqueSuffix + path.extname(sanitizedName));
  },
});

// Enhanced file validation
const validateFileType = (file) => {
  const allowedTypes = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes.includes(ext)) {
    return {
      isValid: false,
      error: `Invalid file type '${ext}'. Only PDF (.pdf), Word (.doc, .docx) documents are allowed.`,
    };
  }

  return { isValid: true };
};

// Basic file corruption detection
const detectFileCorruption = (buffer, filename) => {
  const ext = path.extname(filename).toLowerCase();

  if (ext === ".pdf") {
    // Check for PDF header
    const pdfHeader = buffer.slice(0, 4).toString();
    if (pdfHeader !== "%PDF") {
      return {
        isCorrupted: true,
        error: "PDF file appears to be corrupted - missing PDF header",
      };
    }
  }

  // Check if file is empty
  if (buffer.length === 0) {
    return {
      isCorrupted: true,
      error: "File is empty",
    };
  }

  // Check for minimum file size (100 bytes)
  if (buffer.length < 100) {
    return {
      isCorrupted: true,
      error: "File is too small to be a valid document",
    };
  }

  return { isCorrupted: false };
};

// Enhanced file filter
const fileFilter = (req, file, cb) => {
  console.log(
    `File upload attempt: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size || "unknown"}`,
  );

  const validation = validateFileType(file);
  if (!validation.isValid) {
    console.error(`File validation failed: ${validation.error}`);
    return cb(new Error(validation.error), false);
  }

  cb(null, true);
};

// Configure upload with enhanced error handling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow 1 file
    fieldSize: 1024 * 1024, // 1MB field size limit
  },
});

// Enhanced upload middleware with post-upload validation
const enhancedUpload = (req, res, next) => {
  const singleUpload = upload.single("resume");

  singleUpload(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err.message);

      // Handle specific multer errors
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_FILE_SIZE":
            return res.status(413).json({
              message: "File too large. Maximum size allowed is 5MB.",
              error: "FILE_TOO_LARGE",
            });
          case "LIMIT_FILE_COUNT":
            return res.status(400).json({
              message: "Too many files. Only one resume file is allowed.",
              error: "TOO_MANY_FILES",
            });
          case "LIMIT_UNEXPECTED_FILE":
            return res.status(400).json({
              message: 'Unexpected file field. Use "resume" as the field name.',
              error: "UNEXPECTED_FIELD",
            });
          default:
            return res.status(400).json({
              message: "File upload error: " + err.message,
              error: "UPLOAD_ERROR",
            });
        }
      }

      // Handle custom validation errors
      return res.status(400).json({
        message: err.message,
        error: "VALIDATION_ERROR",
      });
    }

    // Post-upload file validation
    // Post-upload file validation
    if (req.file) {
      try {
        const filePath = req.file.path;
        const fileBuffer = fs.readFileSync(filePath);
        const corruptionCheck = detectFileCorruption(
          fileBuffer,
          req.file.originalname,
        );

        if (corruptionCheck.isCorrupted) {
          // Clean up the uploaded file
          fs.unlinkSync(filePath);
          console.error(`File corruption detected: ${corruptionCheck.error}`);
          return res.status(400).json({
            message: corruptionCheck.error,
            error: "FILE_CORRUPTED",
          });
        }

        console.log(`File upload successful: ${req.file.filename}`);
      } catch (fileError) {
        console.error("Post-upload validation error:", fileError.message);
        // Clean up the file if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          message: "File validation failed after upload",
          error: "POST_UPLOAD_VALIDATION_ERROR",
        });
      }
    }

    next();
  });
};

// Export both the basic upload and enhanced upload
module.exports = enhancedUpload;
module.exports.upload = upload;
module.exports.validateFileType = validateFileType;
module.exports.detectFileCorruption = detectFileCorruption;
