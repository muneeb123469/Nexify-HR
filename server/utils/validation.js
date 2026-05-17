// server/utils/validation.js
const mongoose = require('mongoose');

/**
 * Validates application request data
 * @param {Object} reqBody - Request body containing application data
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateApplicationRequest(reqBody) {
  const errors = [];
  const { jobId, name, email, phone, coverLetter } = reqBody;

  // Required field validation
  if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
    errors.push('jobId is required and must be a non-empty string');
  } else if (!mongoose.Types.ObjectId.isValid(jobId)) {
    errors.push('jobId must be a valid MongoDB ObjectId');
  }

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('name is required and must be a non-empty string');
  } else if (name.trim().length < 2) {
    errors.push('name must be at least 2 characters long');
  } else if (name.trim().length > 100) {
    errors.push('name must not exceed 100 characters');
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('email is required and must be a non-empty string');
  } else if (!isValidEmail(email.trim())) {
    errors.push('email must be a valid email address');
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    errors.push('phone is required and must be a non-empty string');
  } else if (!isValidPhone(phone.trim())) {
    errors.push('phone must be a valid phone number');
  }

  if (!coverLetter || typeof coverLetter !== 'string' || coverLetter.trim() === '') {
    errors.push('coverLetter is required and must be a non-empty string');
  } else if (coverLetter.trim().length < 10) {
    errors.push('coverLetter must be at least 10 characters long');
  } else if (coverLetter.trim().length > 5000) {
    errors.push('coverLetter must not exceed 5000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates uploaded resume file
 * @param {Object} file - Multer file object
 * @returns {Object} - { isValid: boolean, error?: string }
 */
function validateResumeFile(file) {
  if (!file) {
    return {
      isValid: false,
      error: 'Resume file is required'
    };
  }

  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Check file extension
  const ext = require('path').extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return {
      isValid: false,
      error: `Invalid file extension '${ext}'. Only PDF, DOC, and DOCX files are allowed.`
    };
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid file type '${file.mimetype}'. File may be corrupted or renamed.`
    };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the 5MB limit.`
    };
  }

  // Check minimum file size
  if (file.size < 100) {
    return {
      isValid: false,
      error: 'File is too small to be a valid document.'
    };
  }

  return { isValid: true };
}

/**
 * Validates parsed resume data structure
 * @param {Object} data - Parsed resume data
 * @returns {Object} - Validated and sanitized parsed resume data
 */
function validateParsedData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Parsed data must be an object');
  }

  // Sanitize and validate each field
  const validated = {
    name: sanitizeString(data.name),
    email: validateAndSanitizeEmail(data.email),
    phone: sanitizeString(data.phone),
    location: sanitizeString(data.location),
    links: validateAndSanitizeLinks(data.links),
    skills: validateAndSanitizeSkills(data.skills),
    summary: sanitizeString(data.summary),
    education: validateAndSanitizeEducation(data.education),
    experience: validateAndSanitizeExperience(data.experience),
    projects: validateAndSanitizeExperience(data.projects),
    certifications: validateAndSanitizeStringArray(data.certifications),
    languages: validateAndSanitizeStringArray(data.languages),
    rawText: sanitizeString(data.rawText, 200000), // Cap at 200KB
    confidence: validateConfidence(data.confidence),
    parserVersion: sanitizeString(data.parserVersion) || 'unknown',
    parsedAt: validateParsedAt(data.parsedAt)
  };

  return validated;
}

/**
 * Email validation using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Phone validation - accepts various international formats
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
function isValidPhone(phone) {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Accept phone numbers with 7-15 digits
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Sanitizes string input
 * @param {any} input - Input to sanitize
 * @param {number} maxLength - Maximum length (default: 1000)
 * @returns {string|null} - Sanitized string or null
 */
function sanitizeString(input, maxLength = 1000) {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  // Trim and limit length
  let sanitized = input.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized || null;
}

/**
 * Validates and sanitizes email
 * @param {any} email - Email to validate
 * @returns {string|null} - Valid email or null
 */
function validateAndSanitizeEmail(email) {
  const sanitized = sanitizeString(email, 254); // RFC 5321 limit
  if (!sanitized || !isValidEmail(sanitized)) {
    return null;
  }
  return sanitized.toLowerCase();
}

/**
 * Validates and sanitizes links array
 * @param {any} links - Links array to validate
 * @returns {string[]} - Array of valid URLs
 */
function validateAndSanitizeLinks(links) {
  if (!Array.isArray(links)) {
    return [];
  }
  
  const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
  return links
    .filter(link => typeof link === 'string' && urlRegex.test(link.trim()))
    .map(link => link.trim())
    .slice(0, 20); // Limit to 20 links
}

/**
 * Validates and sanitizes skills array
 * @param {any} skills - Skills array to validate
 * @returns {string[]} - Array of valid skills
 */
function validateAndSanitizeSkills(skills) {
  if (!Array.isArray(skills)) {
    return [];
  }
  
  return skills
    .filter(skill => typeof skill === 'string' && skill.trim().length > 0)
    .map(skill => skill.trim())
    .filter(skill => skill.length <= 50) // Max 50 chars per skill
    .slice(0, 100); // Limit to 100 skills
}

/**
 * Validates and sanitizes education array
 * @param {any} education - Education array to validate
 * @returns {Object[]} - Array of valid education entries
 */
function validateAndSanitizeEducation(education) {
  if (!Array.isArray(education)) {
    return [];
  }
  
  return education
    .filter(edu => edu && typeof edu === 'object')
    .map(edu => ({
      institution: sanitizeString(edu.institution, 200),
      degree: sanitizeString(edu.degree, 200),
      field: sanitizeString(edu.field, 200),
      startDate: sanitizeString(edu.startDate, 50),
      endDate: sanitizeString(edu.endDate, 50),
      grade: sanitizeString(edu.grade, 50)
    }))
    .slice(0, 10); // Limit to 10 education entries
}

/**
 * Validates and sanitizes experience array
 * @param {any} experience - Experience array to validate
 * @returns {Object[]} - Array of valid experience entries
 */
function validateAndSanitizeExperience(experience) {
  if (!Array.isArray(experience)) {
    return [];
  }
  
  return experience
    .filter(exp => exp && typeof exp === 'object')
    .map(exp => ({
      company: sanitizeString(exp.company, 200),
      title: sanitizeString(exp.title, 200),
      startDate: sanitizeString(exp.startDate, 50),
      endDate: sanitizeString(exp.endDate, 50),
      location: sanitizeString(exp.location, 200),
      description: sanitizeString(exp.description, 2000)
    }))
    .slice(0, 15); // Limit to 15 experience entries
}

/**
 * Validates and sanitizes string array
 * @param {any} arr - Array to validate
 * @returns {string[]} - Array of valid strings
 */
function validateAndSanitizeStringArray(arr) {
  if (!Array.isArray(arr)) {
    return [];
  }
  
  return arr
    .filter(item => typeof item === 'string' && item.trim().length > 0)
    .map(item => item.trim())
    .filter(item => item.length <= 200) // Max 200 chars per item
    .slice(0, 50); // Limit to 50 items
}

/**
 * Validates confidence score
 * @param {any} confidence - Confidence value to validate
 * @returns {number} - Valid confidence score between 0 and 1
 */
function validateConfidence(confidence) {
  const num = parseFloat(confidence);
  if (isNaN(num) || num < 0 || num > 1) {
    return 0.0;
  }
  return Math.round(num * 100) / 100; // Round to 2 decimal places
}

/**
 * Validates parsed timestamp
 * @param {any} parsedAt - Timestamp to validate
 * @returns {Date} - Valid Date object
 */
function validateParsedAt(parsedAt) {
  if (!parsedAt) {
    return new Date();
  }
  
  const date = new Date(parsedAt);
  if (isNaN(date.getTime())) {
    return new Date();
  }
  
  return date;
}

module.exports = {
  validateApplicationRequest,
  validateResumeFile,
  validateParsedData,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  validateAndSanitizeEmail,
  validateAndSanitizeLinks,
  validateAndSanitizeSkills
};
