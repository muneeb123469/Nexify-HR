# Resume Parser Setup Guide

This guide will help you set up and troubleshoot the resume parsing functionality.

## Quick Setup

### 1. Install Python Dependencies

The resume parser requires Python libraries to process PDF and Word documents. Run this command in the server directory:

```bash
npm run install-python-deps
```

This will install:
- PyMuPDF (for PDF processing)
- python-docx (for Word document processing)

### 2. Test the Parser

After installation, test the parser with an existing resume file:

```bash
npm run test-parser
```

### 3. Check Parser Status

You can also check the parser status via API:

```bash
# Check if dependencies are available
GET /api/applications/parser/status

# Install dependencies via API
POST /api/applications/parser/install
```

## Manual Installation

If the automatic installation fails, install dependencies manually:

```bash
# Make sure you have Python 3.7+ installed
python3 --version

# Install required packages
pip install PyMuPDF==1.24.9
pip install python-docx==1.1.2

# Verify installation
python3 -c "import fitz; print('PyMuPDF version:', fitz.version)"
python3 -c "import docx; print('python-docx imported successfully')"
```

## How It Works

### Application Submission Flow

1. **File Upload**: Resume file is uploaded and validated
2. **Application Creation**: Basic application record is created
3. **Resume Parsing**: PDF/Word file is processed to extract:
   - Personal information (name, email, phone)
   - Skills and technologies
   - Education history
   - Work experience
   - Summary/objective
4. **Data Storage**: Parsed data is stored in the `parsedResume` field
5. **Response**: Complete application data with parsed resume information is returned

### Expected Response Format

When parsing is successful, you'll get a response like this:

```json
{
  "_id": "application_id",
  "job": "job_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "coverLetter": "Cover letter text",
  "resume": "uploads/resume-file.pdf",
  "status": "pending",
  "parsedResume": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, NY",
    "links": ["https://linkedin.com/in/johndoe"],
    "skills": ["JavaScript", "Python", "React", "Node.js"],
    "summary": "Experienced software developer...",
    "education": [
      {
        "institution": "University Name",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "startDate": "2018",
        "endDate": "2022",
        "grade": "3.8 GPA"
      }
    ],
    "experience": [
      {
        "company": "Tech Company",
        "title": "Software Developer",
        "startDate": "Jan 2022",
        "endDate": "Present",
        "location": "Remote",
        "description": "Developed web applications..."
      }
    ],
    "certifications": ["AWS Certified Developer"],
    "languages": ["English", "Spanish"],
    "rawText": "Full resume text...",
    "confidence": 0.85,
    "parserVersion": "cvp-1.0.0",
    "parsedAt": "2025-01-01T00:00:00Z"
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "_metadata": {
    "requestId": "req_12345",
    "processingTime": 2500,
    "parseSuccess": true,
    "parseError": null
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "PyMuPDF (fitz) not available for PDF processing"

**Solution**: Install Python dependencies
```bash
npm run install-python-deps
```

#### 2. "Python command not found"

**Solution**: Make sure Python 3.7+ is installed and accessible
```bash
# On Windows
python --version

# On Mac/Linux
python3 --version

# If not installed, download from https://python.org
```

#### 3. "Permission denied" errors

**Solution**: Run with appropriate permissions or use virtual environment
```bash
# Create virtual environment (optional)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install PyMuPDF==1.24.9 python-docx==1.1.2
```

#### 4. Parsing returns low confidence or missing data

**Possible causes**:
- PDF is image-based (scanned document)
- Unusual resume format
- Corrupted file

**Solutions**:
- Try with a different resume format
- Ensure the PDF contains selectable text
- Check file size (max 50MB)

#### 5. Parsing timeout

**Possible causes**:
- Very large file
- Complex PDF structure
- System performance issues

**Solutions**:
- Reduce file size
- Increase timeout in environment variables:
  ```bash
  export CV_PARSE_TIMEOUT_MS=60000  # 60 seconds
  ```

### Environment Variables

You can customize the parser behavior with these environment variables:

```bash
# Python executable (default: python3)
PYTHON_BIN=python3

# Parsing timeout in milliseconds (default: 30000)
CV_PARSE_TIMEOUT_MS=30000
```

### Logging

The parser provides detailed logging for debugging:

- Request IDs for tracking individual requests
- Processing times for performance monitoring
- Detailed error messages for troubleshooting
- Parse success/failure status

Check your server logs for detailed information about parsing attempts.

### API Endpoints

#### Submit Application
```
POST /api/applications
Content-Type: multipart/form-data

Fields:
- jobId: string (required)
- name: string (required)
- email: string (required)
- phone: string (required)
- coverLetter: string (required)
- resume: file (required, PDF/DOC/DOCX)
```

#### Reparse Resume
```
POST /api/applications/:id/reparse
```

#### Check Parser Status
```
GET /api/applications/parser/status
```

#### Install Dependencies
```
POST /api/applications/parser/install
```

## Performance Tips

1. **File Size**: Keep resume files under 5MB for best performance
2. **Format**: PDF files with selectable text work best
3. **Concurrent Requests**: The parser handles multiple requests but may be slower under heavy load
4. **Caching**: Parsed results are stored in the database to avoid re-parsing

## Support

If you continue to have issues:

1. Check the server logs for detailed error messages
2. Test with the provided test script: `npm run test-parser`
3. Verify Python installation and dependencies
4. Try with a simple, text-based PDF resume

The parser is designed to be robust and will gracefully handle failures, ensuring that application submission succeeds even if parsing fails.