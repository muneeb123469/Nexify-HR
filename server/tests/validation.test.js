// server/tests/validation.test.js
const {
  validateApplicationRequest,
  validateResumeFile,
  validateParsedData,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  validateAndSanitizeEmail,
  validateAndSanitizeLinks,
  validateAndSanitizeSkills
} = require('../utils/validation');

describe('Validation Utils', () => {
  
  describe('validateApplicationRequest', () => {
    const validRequest = {
      jobId: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      coverLetter: 'This is a valid cover letter with sufficient length.'
    };

    test('should validate correct request data', () => {
      const result = validateApplicationRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject missing jobId', () => {
      const request = { ...validRequest, jobId: '' };
      const result = validateApplicationRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('jobId is required and must be a non-empty string');
    });

    test('should reject invalid ObjectId', () => {
      const request = { ...validRequest, jobId: 'invalid-id' };
      const result = validateApplicationRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('jobId must be a valid MongoDB ObjectId');
    });

    test('should reject short name', () => {
      const request = { ...validRequest, name: 'A' };
      const result = validateApplicationRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name must be at least 2 characters long');
    });

    test('should reject invalid email', () => {
      const request = { ...validRequest, email: 'invalid-email' };
      const result = validateApplicationRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email must be a valid email address');
    });

    test('should reject short cover letter', () => {
      const request = { ...validRequest, coverLetter: 'Short' };
      const result = validateApplicationRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('coverLetter must be at least 10 characters long');
    });
  });

  describe('validateResumeFile', () => {
    test('should validate PDF file', () => {
      const file = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024 // 1MB
      };
      const result = validateResumeFile(file);
      expect(result.isValid).toBe(true);
    });

    test('should reject missing file', () => {
      const result = validateResumeFile(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Resume file is required');
    });

    test('should reject invalid extension', () => {
      const file = {
        originalname: 'resume.txt',
        mimetype: 'text/plain',
        size: 1024
      };
      const result = validateResumeFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file extension');
    });

    test('should reject file too large', () => {
      const file = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 6 * 1024 * 1024 // 6MB
      };
      const result = validateResumeFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds the 5MB limit');
    });

    test('should reject file too small', () => {
      const file = {
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
        size: 50 // 50 bytes
      };
      const result = validateResumeFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File is too small to be a valid document.');
    });
  });

  describe('isValidEmail', () => {
    test('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@test-domain.org')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('should validate correct phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false); // Too short
      expect(isValidPhone('12345678901234567890')).toBe(false); // Too long
      expect(isValidPhone('abc')).toBe(false); // No digits
    });
  });

  describe('sanitizeString', () => {
    test('should sanitize valid strings', () => {
      expect(sanitizeString('  Hello World  ')).toBe('Hello World');
      expect(sanitizeString('Valid String')).toBe('Valid String');
    });

    test('should return null for invalid inputs', () => {
      expect(sanitizeString(null)).toBe(null);
      expect(sanitizeString(undefined)).toBe(null);
      expect(sanitizeString(123)).toBe(null);
      expect(sanitizeString('')).toBe(null);
      expect(sanitizeString('   ')).toBe(null);
    });

    test('should truncate long strings', () => {
      const longString = 'a'.repeat(2000);
      const result = sanitizeString(longString, 100);
      expect(result).toHaveLength(100);
    });
  });

  describe('validateAndSanitizeEmail', () => {
    test('should sanitize and validate emails', () => {
      expect(validateAndSanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(validateAndSanitizeEmail('user@domain.org')).toBe('user@domain.org');
    });

    test('should return null for invalid emails', () => {
      expect(validateAndSanitizeEmail('invalid-email')).toBe(null);
      expect(validateAndSanitizeEmail(null)).toBe(null);
      expect(validateAndSanitizeEmail('')).toBe(null);
    });
  });

  describe('validateAndSanitizeLinks', () => {
    test('should validate and sanitize links', () => {
      const links = [
        'https://linkedin.com/in/user',
        'http://github.com/user',
        'invalid-link',
        'https://portfolio.com'
      ];
      const result = validateAndSanitizeLinks(links);
      expect(result).toHaveLength(3);
      expect(result).toContain('https://linkedin.com/in/user');
      expect(result).not.toContain('invalid-link');
    });

    test('should return empty array for invalid input', () => {
      expect(validateAndSanitizeLinks(null)).toEqual([]);
      expect(validateAndSanitizeLinks('not-array')).toEqual([]);
    });
  });

  describe('validateAndSanitizeSkills', () => {
    test('should validate and sanitize skills', () => {
      const skills = ['JavaScript', '  Python  ', '', 'React', null, 'Node.js'];
      const result = validateAndSanitizeSkills(skills);
      expect(result).toHaveLength(4);
      expect(result).toContain('JavaScript');
      expect(result).toContain('Python');
      expect(result).not.toContain('');
    });

    test('should limit skills array length', () => {
      const manySkills = Array(150).fill('Skill');
      const result = validateAndSanitizeSkills(manySkills);
      expect(result).toHaveLength(100);
    });
  });

  describe('validateParsedData', () => {
    const validParsedData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'New York',
      links: ['https://linkedin.com/in/john'],
      skills: ['JavaScript', 'Python'],
      summary: 'Experienced developer',
      education: [{
        institution: 'University',
        degree: 'Bachelor',
        field: 'Computer Science',
        startDate: '2018',
        endDate: '2022',
        grade: 'A'
      }],
      experience: [{
        company: 'Tech Corp',
        title: 'Developer',
        startDate: '2022',
        endDate: 'Present',
        location: 'Remote',
        description: 'Developed applications'
      }],
      certifications: ['AWS Certified'],
      languages: ['English', 'Spanish'],
      rawText: 'Resume text content',
      confidence: 0.85,
      parserVersion: 'cvp-1.0.0',
      parsedAt: '2023-01-01T00:00:00Z'
    };

    test('should validate and sanitize complete parsed data', () => {
      const result = validateParsedData(validParsedData);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.confidence).toBe(0.85);
      expect(result.skills).toHaveLength(2);
      expect(result.education).toHaveLength(1);
      expect(result.experience).toHaveLength(1);
    });

    test('should handle missing or invalid fields', () => {
      const invalidData = {
        name: null,
        email: 'invalid-email',
        skills: 'not-array',
        confidence: 'invalid'
      };
      const result = validateParsedData(invalidData);
      expect(result.name).toBe(null);
      expect(result.email).toBe(null);
      expect(result.skills).toEqual([]);
      expect(result.confidence).toBe(0.0);
    });

    test('should throw error for non-object input', () => {
      expect(() => validateParsedData(null)).toThrow('Parsed data must be an object');
      expect(() => validateParsedData('string')).toThrow('Parsed data must be an object');
    });
  });
});