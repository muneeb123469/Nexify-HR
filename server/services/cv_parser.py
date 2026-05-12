# server/services/cv_parser.py
import sys, json, re, os, math, logging
from datetime import datetime
from pdfminer.high_level import extract_text
from pdf2image import convert_from_path
from pytesseract import image_to_string

# Configure logging to stderr so it doesn't interfere with JSON output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)  # FIXED: Changed _name_ to __name__

# Optional imports guarded to avoid hard fails on missing deps
def try_import(name):
    try:
        return __import__(name)
    except Exception:
        return None

# Try to import PDF libraries - if not available, we'll use alternative methods
fitz = try_import("fitz")              # PyMuPDF
docx = try_import("docx")              # python-docx
spacy = try_import("spacy")            # optional

# Enhanced PDF extraction libraries
pdfminer_extract_text = None
pdf2image_convert = None
pytesseract_image_to_string = None

try:
    from pdfminer.high_level import extract_text as pdfminer_extract_text
    logger.info("pdfminer.six available for PDF extraction")
except ImportError:
    logger.warning("pdfminer.six not available - install with: pip install pdfminer.six")

try:
    from pdf2image import convert_from_path as pdf2image_convert
    logger.info("pdf2image available for PDF to image conversion")
except ImportError:
    logger.warning("pdf2image not available - install with: pip install pdf2image")

try:
    import pytesseract
    pytesseract_image_to_string = pytesseract.image_to_string
    logger.info("pytesseract available for OCR")
except ImportError:
    logger.warning("pytesseract not available - install with: pip install pytesseract")

# Import built-in libraries that should always be available
import subprocess
import tempfile
import unicodedata

EMAIL_RE = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
PHONE_RE = re.compile(r'(\+?\d[\d\-\s().]{7,}\d)')

# Accept bare domains and add scheme if missing
URL_RE = re.compile(
    r'((?:https?://)?(?:www\.)?(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}(?:/[^\s)]+)?)'
)

SKILL_BANK = {s.lower() for s in """
JavaScript TypeScript React Redux Node.js Express MongoDB Mongoose SQL PostgreSQL
Python Django Flask FastAPI Pandas NumPy scikit-learn TensorFlow PyTorch
AWS GCP Azure Docker Kubernetes CI/CD Terraform Git Linux HTML CSS Tailwind
Next.js NestJS GraphQL REST SOAP gRPC Redis RabbitMQ Kafka Elasticsearch
Jest Mocha Cypress Playwright Selenium Figma Photoshop Illustrator
""".split() if s}

HEADINGS = [
    "experience", "work experience", "professional experience", "employment",
    "education", "academic background", "qualifications",
    "skills", "technical skills", "core competencies", "expertise",
    "projects", "certifications", "certificates", "licenses",
    "summary", "profile", "objective", "about", "overview"
]

# Fix broken all-caps word spacing like "C OMSAT S" -> "COMSATS"
CAPS_GUNK_RE = re.compile(r'(?<=\b)([A-Z])\s+(?=[A-Z])')

def normalize_text(s: str) -> str:
    """Normalize/clean extracted text to mitigate PDF artifacts."""
    if not isinstance(s, str):
        return s
    s = unicodedata.normalize('NFKC', s)
    s = s.replace('\uFFFD', '')            # drop replacement glyph
    s = re.sub(r'[ \t]+', ' ', s)          # collapse runs of spaces/tabs
    for _ in range(3):                     # fix spaced caps over a few passes
        s = CAPS_GUNK_RE.sub(r'\1', s)
    s = '\n'.join(line.strip() for line in s.splitlines())
    return s

def normalize_date(date_str):
    """
    Normalize various date formats to a consistent format.
    Examples returned: "Jan 2024", "2024", "Present"
    """
    if not date_str or not isinstance(date_str, str):
        return None

    date_str = date_str.strip()

    # Handle "Present" or "Current"
    if date_str.lower() in ['present', 'current', 'now']:
        return 'Present'

    # Month Year format (Jan 2020, January 2020)
    month_year_pattern = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\w*\s+(\d{4})'
    match = re.search(month_year_pattern, date_str, re.IGNORECASE)
    if match:
        month_map = {
            'jan': 'Jan', 'feb': 'Feb', 'mar': 'Mar', 'apr': 'Apr',
            'may': 'May', 'jun': 'Jun', 'jul': 'Jul', 'aug': 'Aug',
            'sep': 'Sep', 'sept': 'Sept', 'oct': 'Oct', 'nov': 'Nov', 'dec': 'Dec'
        }
        head = match.group(1)[:5].lower()
        month = month_map.get(head, match.group(1))
        return f"{month} {match.group(2)}"

    # MM/YYYY format
    mm_yyyy_pattern = r'(\d{1,2})/(\d{4})'
    match = re.search(mm_yyyy_pattern, date_str)
    if match:
        month_num = int(match.group(1))
        if 1 <= month_num <= 12:
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            return f"{months[month_num-1]} {match.group(2)}"

    # Year only
    year_pattern = r'^(\d{4})$'
    match = re.search(year_pattern, date_str)
    if match:
        return match.group(1)

    return date_str

def clean_text_field(text, max_length=None):
    """
    Clean and normalize text fields, returning None for empty.
    """
    if not text or not isinstance(text, str):
        return None

    cleaned = ' '.join(text.split())
    # Remove common artifacts (but allow punctuation like .,-()/&)
    cleaned = re.sub(r'[^\w\s\.\-,()&/]', ' ', cleaned)
    cleaned = ' '.join(cleaned.split())

    if max_length and len(cleaned) > max_length:
        cleaned = cleaned[:max_length].rsplit(' ', 1)[0] + '...'

    return cleaned.strip() if cleaned.strip() else None

def normalize_path(filepath):
    """Normalize file path to handle different OS path separators and existence."""
    if not filepath:
        return None
    abs_path = os.path.abspath(filepath)
    if not os.path.exists(abs_path):
        logger.error(f"File not found: {abs_path}")
        raise FileNotFoundError(f"File not found: {abs_path}")
    return abs_path

def read_file_text(path):
    """
    Extract text from various file formats with robust error handling.
    """
    try:
        abs_path = normalize_path(path)
        logger.info(f"Reading file: {abs_path}")

        if not os.path.isfile(abs_path):
            raise ValueError(f"Path is not a file: {abs_path}")

        # Check file size (max 50MB)
        file_size = os.path.getsize(abs_path)
        if file_size > 50 * 1024 * 1024:
            raise ValueError(f"File too large: {file_size} bytes (max 50MB)")

        if file_size == 0:
            raise ValueError("File is empty")

        ext = os.path.splitext(abs_path)[1].lower()
        text = ""

        # PDF processing with multiple extraction methods
        if ext == ".pdf":
            text = extract_pdf_text(abs_path)
            if text and len(text.strip()) > 0:
                return text.strip()
            else:
                raise ValueError("Could not extract text from PDF - file may be corrupted or image-based")

        # DOCX processing
        elif ext == ".docx":
            text = extract_docx_text(abs_path)
            if text and len(text.strip()) > 0:
                return text.strip()
            else:
                raise ValueError("Could not extract text from DOCX file")

        # DOC processing (basic support)
        elif ext == ".doc":
            # Try to read as plain text (limited support)
            try:
                with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                if len(text.strip()) > 0:
                    return text.strip()
            except Exception as e:
                raise ValueError(f"Could not read DOC file: {str(e)}")

        # Plain text fallback
        else:
            try:
                with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                if len(text.strip()) > 0:
                    return text.strip()
            except Exception as e:
                raise ValueError(f"Could not read file as text: {str(e)}")

        raise ValueError("No text could be extracted from the file")

    except Exception as e:
        error_msg = f"File processing error: {str(e)}"
        logger.error(error_msg)
        raise ValueError(error_msg)

def extract_pdf_text(path):
    """
    Extract text from PDF with multiple methods and fallbacks.
    """
    if not fitz:
        logger.error("PyMuPDF (fitz) not available for PDF processing")
        raise ImportError("PyMuPDF (fitz) not available for PDF processing")

    text = ""
    doc = None

    try:
        logger.info(f"Opening PDF file: {path}")
        doc = fitz.open(path)

        # Check if PDF is encrypted
        if doc.needs_pass:
            logger.error("PDF is password protected")
            raise ValueError("PDF is password protected")

        # Check page count
        if doc.page_count == 0:
            logger.error("PDF has no pages")
            raise ValueError("PDF has no pages")

        if doc.page_count > 50:
            logger.error(f"PDF has too many pages: {doc.page_count} (max 50)")
            raise ValueError(f"PDF has too many pages: {doc.page_count} (max 50)")

        logger.info(f"PDF opened successfully, processing {doc.page_count} pages")

        # Extract text from all pages
        for page_num in range(doc.page_count):
            try:
                page = doc[page_num]
                page_text = page.get_text("text")
                if page_text:
                    text += page_text + "\n"
                    logger.debug(f"Page {page_num + 1}: extracted {len(page_text)} characters")
            except Exception as e:
                logger.warning(f"Could not extract text from page {page_num + 1}: {str(e)}")
                continue

        # If standard extraction failed, try alternative methods
        if len(text.strip()) < 50:  # Very little text extracted
            logger.warning("Standard text extraction yielded little content, trying alternative methods")

            # Method 2: Try extracting with different text flags
            for page_num in range(min(doc.page_count, 10)):  # Limit to first 10 pages for alt methods
                try:
                    page = doc[page_num]
                    alt_text = page.get_text("dict")
                    if alt_text and "blocks" in alt_text:
                        for block in alt_text["blocks"]:
                            if "lines" in block:
                                for line in block["lines"]:
                                    if "spans" in line:
                                        for span in line["spans"]:
                                            if "text" in span:
                                                text += span["text"] + " "
                                        text += "\n"
                    logger.debug(f"Alternative extraction for page {page_num + 1}: {len(text)} total characters")
                except Exception as e:
                    logger.warning(f"Alternative extraction failed for page {page_num + 1}: {str(e)}")
                    continue

        logger.info(f"PDF text extraction completed: {len(text)} characters extracted")
        return text

    except Exception as e:
        error_msg = f"PDF processing error: {str(e)}"
        logger.error(error_msg)
        raise ValueError(error_msg)

    finally:
        if doc:
            try:
                doc.close()
            except:
                pass

def extract_docx_text(path):
    """
    Extract text from DOCX files with error handling.
    """
    if not docx:
        raise ImportError("python-docx not available for DOCX processing")

    try:
        doc = docx.Document(path)
        text_parts = []

        # Extract text from paragraphs
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text.strip())

        # Extract text from tables
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        text_parts.append(cell.text.strip())

        return "\n".join(text_parts)

    except Exception as e:
        error_msg = f"DOCX processing error: {str(e)}"
        print(error_msg, file=sys.stderr)
        raise ValueError(error_msg)

def validate_extracted_text(text):
    """
    Validate that extracted text is meaningful.
    """
    if not text or not isinstance(text, str):
        return False, "No text extracted"

    text = text.strip()

    if len(text) < 50:
        return False, f"Text too short: {len(text)} characters (minimum 50)"

    # Check for reasonable character distribution
    alpha_chars = sum(1 for c in text if c.isalpha())
    if alpha_chars < len(text) * 0.3:  # At least 30% alphabetic characters
        return False, f"Text appears corrupted - too few alphabetic characters: {alpha_chars}/{len(text)}"

    # Check for reasonable word count
    words = text.split()
    if len(words) < 10:
        return False, f"Too few words: {len(words)} (minimum 10)"

    return True, "Text validation passed"

def find_phone(text):
    m = PHONE_RE.search(text)
    if not m:
        return None
    ph = m.group(0)
    # keep '+' and digits; collapse other separators to single spaces
    ph = re.sub(r'[^0-9+]+', ' ', ph).strip()
    ph = re.sub(r'\s+', ' ', ph)
    return ph

def find_links(text):
    links = []
    for m in URL_RE.finditer(text):
        u = m.group(0).strip('.,);')
        if EMAIL_RE.fullmatch(u):
            continue
        if not u.startswith(('http://', 'https://')):
            u = 'https://' + u
        if u not in links:
            links.append(u)
    return links

def guess_name(text):
    """
    Enhanced name detection with multiple strategies.
    """
    lines = text.splitlines()

    # Strategy 1: Look for name patterns in first 20 lines
    for i, line in enumerate(lines[:20]):
        line = line.strip()
        if not line or len(line) < 3:
            continue

        # Skip lines that look like headers, emails, phones, or addresses
        if any(skip_word in line.lower() for skip_word in [
            'resume', 'curriculum', 'cv', '@', 'phone', 'email', 'address',
            'street', 'city', 'state', 'zip', 'country', 'linkedin', 'github'
        ]):
            continue

        words = line.split()
        if 2 <= len(words) <= 4:  # Names typically 2-4 words
            name_words = []
            for word in words:
                clean_word = re.sub(r'[^\w\s-]', '', word)
                if (clean_word and
                    clean_word[0].isupper() and
                    clean_word.isalpha() and
                    2 <= len(clean_word) <= 20):
                    name_words.append(clean_word)

            if len(name_words) >= 2 and len(name_words) == len(words):
                return ' '.join(name_words)

    # Strategy 2: Look for "Name:" or similar patterns


def extract_skills(text):
    """
    Enhanced skill extraction with better pattern matching and validation.
    """
    found_skills = set()
    text_lower = text.lower()

    # Method 1: Direct word matching with context validation
    words = re.findall(r"[A-Za-z0-9\.\+#\-]+", text_lower)
    word_set = set(words)

    for skill in SKILL_BANK:
        skill_lower = skill.lower()
        if skill_lower in word_set:
            found_skills.add(skill)
        elif " " in skill_lower and skill_lower in text_lower:
            pattern = r'\b' + re.escape(skill_lower) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.add(skill)

    # Method 2: Look for skills in dedicated sections
    sections = split_sections(text)
    skills_section = sections.get("skills", "")

    if skills_section:
        skill_patterns = [
            r'[•\-]\s*([A-Za-z0-9\.\+#\-\s]+)',  # Bullet points
            r'([A-Za-z0-9\.\+#\-]+)(?:\s*[,;]\s*)',  # Comma/semicolon separated
            r'([A-Za-z0-9\.\+#\-]+)(?:\s*\n)',  # Line separated
        ]
        for pattern in skill_patterns:
            matches = re.findall(pattern, skills_section, re.IGNORECASE)
            for match in matches:
                clean_skill = match.strip()
                if clean_skill and len(clean_skill) <= 30:
                    if clean_skill.lower() in [s.lower() for s in SKILL_BANK]:
                        for bank_skill in SKILL_BANK:
                            if bank_skill.lower() == clean_skill.lower():
                                found_skills.add(bank_skill)
                                break
                    elif is_likely_skill(clean_skill):
                        found_skills.add(clean_skill.title())
    for pattern in tech_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            found_skills.add(match)

    validated_skills = []
    for skill in found_skills:
        clean_skill = clean_skill_name(skill)
        if clean_skill and 2 <= len(clean_skill) <= 30:
            validated_skills.append(clean_skill)

    return sorted(set(validated_skills))

def is_likely_skill(text):
    text = text.strip()
    if len(text) < 2 or len(text) > 30:
        return False
    skill_indicators = [
        r'\b\w+\.js\b',  # JavaScript frameworks
        r'\b\w+SQL\b',   # Database technologies
        r'\bAPI\b',      # API related
        r'\b\w+\+\+\b',  # C++, etc.
        r'\b\w+#\b',     # C#, F#, etc.
    ]
    for pattern in skill_indicators:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    if re.search(r'\d+\.\d+', text):
        return True
    return False

def clean_skill_name(skill):
    if not skill:
        return None
    clean = re.sub(r'[^\w\s\.\+#\-]', '', skill).strip()
    replacements = {
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'nodejs': 'Node.js',
        'reactjs': 'React',
        'vuejs': 'Vue.js',
        'angularjs': 'Angular',
        'mysql': 'MySQL',
        'postgresql': 'PostgreSQL',
        'mongodb': 'MongoDB',
        'css3': 'CSS',
        'html5': 'HTML'
    }
    clean_lower = clean.lower()
    if clean_lower in replacements:
        return replacements[clean_lower]
    return clean

def split_sections(text):
    """Rough section splitter by heading keywords."""
    sections, current = {}, "summary"
    sections[current] = []
    for line in text.splitlines():
        l = line.strip().lower()
        if any(h in l for h in HEADINGS if len(l) <= 60):
            current = next((h for h in HEADINGS if h in l), current)
            sections.setdefault(current, [])
        sections[current].append(line)
    return {k: "\n".join(v).strip() for k, v in sections.items()}

def extract_summary(text, sections):
    """Safe summary: never treat phone/email lines as summary; return None if not found."""
    for key in ('summary', 'profile', 'objective', 'about', 'overview'):
        sec = sections.get(key)
        if sec:
            ln = sec.strip()
            if not EMAIL_RE.search(ln) and not PHONE_RE.search(ln) and len(ln.split()) >= 6:
                return ln
    head = '\n'.join(text.splitlines()[:14])
    candidates = [l.strip() for l in head.splitlines()
                  if len(l.split()) >= 6 and not EMAIL_RE.search(l) and not PHONE_RE.search(l)]
    return candidates[0] if candidates else None

def extract_certifications(sections):
    """Extract bullet/line items from a 'Certifications'/'Certificates' section."""
    sec = sections.get('certifications') or sections.get('certificates') or ''
    if not sec:
        return []
    out = []
    for ln in sec.splitlines():
        ln = ln.lstrip('-â€¢*').strip()
        if ln and len(ln.split()) >= 2:
            out.append(ln.rstrip('.'))
    # de-duplicate preserving order
    seen, dedup = set(), []
    for item in out:
        if item not in seen:
            seen.add(item)
            dedup.append(item)
    return dedup

def extract_education(sec_text):
    """
    Completely rewritten education extraction to handle specific CV formats.
    """
    items = []
    if not sec_text:
        return items
    # Clean and normalize the text first
    sec_text = normalize_education_text(sec_text)
    lines = [line.strip() for line in sec_text.split('\n') if line.strip()]

    if not lines:
        return items
    logger.debug(f"Education section after normalization: {lines}")
    
    i = 0
    while i < len(lines):
        current_line = lines[i].strip()

        if should_skip_line(current_line):
            i += 1
            continue

        if is_institution_line(current_line):
            logger.debug(f"Found institution at line {i}: '{current_line}'")
            entry = create_education_entry(current_line)

            j = i + 1
            lines_processed = 0
            max_lookahead = 4
    return items[:8]

def normalize_education_text(text):
    """Fix common OCR issues in education text"""
    if not text:
        return text

    fixes = [
        (r'\bC OMSAT S\b', 'COMSATS'),
        (r'\bCOMSAT S\b', 'COMSATS'),
        (r'\bCOMSAT SUNIVERSITY\b', 'COMSATS UNIVERSITY'),
        (r'\bI SLAMABAD\b', 'ISLAMABAD'),
        (r'\bUET,U n i v e r s i t y\b', 'UET University'),
        (r'\bU n i v e r s i t y\b', 'University'),
        (r'\b([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])\b', r'\1\2\3\4'),
        (r'\b([A-Z])\s+([A-Z])\s+([A-Z])\b', r'\1\2\3'),
        (r'\b([A-Z])\s+([A-Z])\b', r'\1\2'),
    ]

    for pattern, replacement in fixes:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    return text

def should_skip_line(line):
    """Check if line should be skipped"""
    if not line or len(line.strip()) < 3:
        return True
    
    if line.lower().strip() in ['education', 'academic background', 'qualifications']:
        return True

    if is_personal_name(line):
        return True

    return False

def is_personal_name(text):
    """Detect if text is a personal name"""
    if not text:
        return False
    
    words = text.split()
    if len(words) < 2 or len(words) > 4:
        return False

    if not all(word.isalpha() and word[0].isupper() for word in words):
        return False

    institution_words = {
        'university', 'college', 'institute', 'school', 'academy',
        'comsats', 'gpgc', 'uet', 'punjab', 'lahore', 'islamabad'
    }
    
    text_lower = text.lower()
    if any(word in text_lower for word in institution_words):
        return False

    name_indicators = ['muhammad', 'ahmad', 'ali', 'hassan', 'fatima']
    if any(name in text_lower for name in name_indicators):
        return True

    return False

def is_institution_line(text):
    """Check if line represents an educational institution"""
    if not text or len(text.strip()) < 4:
        return False

    text_lower = text.lower().strip()
    
    strong_indicators = ['university', 'college', 'institute', 'school', 'academy']
    if any(indicator in text_lower for indicator in strong_indicators):
        return True

    specific_institutions = ['comsats', 'gpgc', 'uet', 'punjab university', 'lums', 'nust', 'fast']
    if any(inst in text_lower for inst in specific_institutions):
        return True

    if re.search(r'^[A-Z][A-Z\s,]+$', text):
        # Allow comma for city, e.g., "GPGC, MUZAFFARGARH"
        parts = text.split(',')
        if len(parts) == 2 and parts[0].strip() and parts[1].strip():
            return True

    return False

def create_education_entry(institution_text):
    """Create a new education entry with cleaned institution name"""
    return {
        "institution": clean_institution_name(institution_text),
        "degree": None,
        "field": None,
        "grade": None
    }

def clean_institution_name(text):
    """Clean institution name"""
    if not text:
        return None
    
    # Remove dates from the institution name itself
    text = re.sub(r'\b\d{4}\s*[-â€"â€"]\s*(\d{4}|present|current)\b', '', text, flags=re.IGNORECASE)
    month_pattern = r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}\b'
    text = re.sub(month_pattern, '', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(19\d{2}|20\d{2})\b', '', text)
    
    return ' '.join(text.split()).strip()

def extract_dates_from_line(line):
    """Extract start and end dates from a single line."""
    if not line:
        return None, None

    # Pattern: YYYY-YYYY or YYYY - YYYY
    match = re.search(r'(\b(19|20)\d{2}\b)\s*[-â€"â€"]\s*(\b(19|20)\d{2}\b)', line)
    if match:
        return match.group(1), match.group(3)

    # Pattern: YYYY-Present
    match = re.search(r'(\b(19|20)\d{2}\b)\s*[-â€"â€"]\s*(present|current)', line, re.IGNORECASE)
    if match:
        return match.group(1), 'Present'

    # Pattern: Month YYYY (full or abbreviated)
    month_pattern = r'\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4})\b'
    match = re.search(month_pattern, line, re.IGNORECASE)
    if match:
        return None, match.group(1).strip()

    # Standalone single year (less likely to be a start date)
    match = re.search(r'\b((19|20)\d{2})\b', line)
    if match:
         # To avoid grabbing random numbers, check context, but for now we assume it's an end date if found
        return None, match.group(1)

    return None, None

def extract_degree_info(line):
    """Extract degree and field information from a line."""
    if not line:
        return None, None

    degree = None
    field = None

    patterns = [
        (r"(Bachelor'?s?)\s+(?:Degree\s+)?(?:in\s+|of\s+)?(.+)", "Bachelor's"),
        (r"(B\.?S\.?)\s*(?:in\s+)?(.+)", "Bachelor's"),
        (r"(Master'?s?)\s+(?:Degree\s+)?(?:in\s+|of\s+)?(.+)", "Master's"),
        (r"(M\.?S\.?|MS)\s*(?:in\s+)?(.+)", "Master's"),
        (r"(Intermediate)\s+(?:in\s+|of\s+)?(.+)", "Intermediate"),
        (r"(MBA|Ph\.?D\.?|Doctorate)\s*(?:in\s+)?(.+)?", None),
        (r"(Diploma)\s+(?:in\s+|of\s+)?(.+)", "Diploma")
    ]

    for pattern, default_degree in patterns:
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            degree = default_degree if default_degree else match.group(1).strip()
            if len(match.groups()) >= 2 and match.group(2):
                field_text = match.group(2).strip()
                field = clean_field_name(field_text)
            break

    if not degree and not field:
        line_lower = line.lower()
        if 'computer science' in line_lower:
            field = 'Computer Science'
        elif 'engineering' in line_lower:
            field = 'Engineering'

    return degree, field

def clean_field_name(field_text):
    """Clean up field of study name, removing dates and other artifacts."""
    if not field_text:
        return None

    # Remove date ranges and standalone years
    field_text = re.sub(r'\b\d{4}\s*[-â€"â€"]\s*(\d{4}|present|current)\b', '', field_text, flags=re.IGNORECASE)
    month_pattern = r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}\b'
    field_text = re.sub(month_pattern, '', field_text, flags=re.IGNORECASE)
    field_text = re.sub(r'\b(19\d{2}|20\d{2})\b', '', field_text)
    
    # Remove other artifacts
    field_text = re.sub(r'\s*\([^)]*\)', '', field_text)
    field_text = re.sub(r'\s*[-â€"â€"].*', '', field_text)
    field_text = re.sub(r'^Degree\s+(?:in\s+)?', '', field_text, flags=re.IGNORECASE)

    field_lower = field_text.lower()
    if 'computer science' in field_lower:
        return 'Computer Science'
    elif 'engineering' in field_lower:
        return 'Engineering'
    elif 'business' in field_lower:
        return 'Business Administration'
    
    field_text = ' '.join(word.capitalize() for word in field_text.split())
    return field_text.strip() if field_text.strip() else None


def extract_experience(sec_text):
    """
    Completely rewritten experience extraction following education section logic.
    """
    items = []
    if not sec_text:
        return items
    
    # Clean and normalize the text first
    sec_text = normalize_experience_text(sec_text)
    lines = [line.strip() for line in sec_text.split('\n') if line.strip()]

    if not lines:
        return items
    
    logger.debug(f"Experience section after normalization: {lines}")
    
    i = 0
    while i < len(lines):
        current_line = lines[i].strip()

        if should_skip_experience_line(current_line):
            i += 1
            continue

        if is_experience_header_line(current_line):
            logger.debug(f"Found experience header at line {i}: '{current_line}'")
            entry = create_experience_entry(current_line)

            j = i + 1
            lines_processed = 0
            max_lookahead = 6  # More lines than education since experience can have descriptions
            description_lines = []

            while j < len(lines) and lines_processed < max_lookahead:
                next_line = lines[j].strip()

                if not next_line:
                    j += 1
                    lines_processed += 1
                    continue
                
                # If we hit another experience header, stop processing for the current entry
                if is_experience_header_line(next_line):
                    break

                # Check for location
                location = extract_location_from_line(next_line)
                if location and entry["location"] is None:
                    entry["location"] = location
                    logger.debug(f"Found location in line {j}: '{location}'")

                # If line doesn't contain location, treat as description
                if not location:
                    # Skip if it's just repeating the title or company
                    if (next_line != entry.get("title") and 
                        next_line != entry.get("company") and
                        not is_redundant_line(next_line, entry)):
                        description_lines.append(next_line)
                
                j += 1
                lines_processed += 1

            # Set description if we found any
            if description_lines:
                entry["description"] = '\n'.join(description_lines)

            # Only add entry if we have at least title or company
            if entry["title"] or entry["company"]:
                items.append(entry)
                logger.debug(f"Added experience entry: {entry}")

            i = j
        else:
            i += 1

    return items[:12]  # Limit to 12 entries

def normalize_experience_text(text):
    """Fix common OCR issues in experience text"""
    if not text:
        return text

    fixes = [
        # Fix company name OCR issues
        (r'\bSoftw are\b', 'Software'),
        (r'\bTechnolog ies\b', 'Technologies'),
        (r'\bSyst ems\b', 'Systems'),
        (r'\bSolut ions\b', 'Solutions'),
        (r'\bCompan y\b', 'Company'),
        (r'\bCorporat ion\b', 'Corporation'),
        (r'\bLt d\b', 'Ltd'),
        (r'\bIn c\b', 'Inc'),
        
        # Fix job title OCR issues
        (r'\bSoftw are\s+Engin eer\b', 'Software Engineer'),
        (r'\bSenior\s+Develop er\b', 'Senior Developer'),
        (r'\bProj ect\s+Manag er\b', 'Project Manager'),
        (r'\bData\s+Analy st\b', 'Data Analyst'),
        
        # General OCR fixes
        (r'\b([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z])\b', r'\1\2\3\4'),
        (r'\b([A-Z])\s+([A-Z])\s+([A-Z])\b', r'\1\2\3'),
        (r'\b([A-Z])\s+([A-Z])\b', r'\1\2'),
    ]

    for pattern, replacement in fixes:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    return text

def should_skip_experience_line(line):
    """Check if line should be skipped"""
    if not line or len(line.strip()) < 3:
        return True
    
    skip_headers = [
        'experience', 'work experience', 'professional experience',
        'employment history', 'career history', 'work history'
    ]
    if line.lower().strip() in skip_headers:
        return True

    if is_personal_name(line):
        return True

    return False

def is_experience_header_line(text):
    """Check if line represents start of an experience entry (title/company)"""
    if not text or len(text.strip()) < 4:
        return False

    text_lower = text.lower().strip()
    
    # Check for job title patterns
    job_title_indicators = [
        'engineer', 'developer', 'programmer', 'analyst', 'manager',
        'director', 'lead', 'senior', 'junior', 'intern', 'trainee',
        'specialist', 'consultant', 'coordinator', 'supervisor',
        'executive', 'officer', 'head', 'chief', 'assistant'
    ]
    
    # Check for company indicators
    company_indicators = [
        'inc', 'corp', 'ltd', 'llc', 'company', 'corporation',
        'technologies', 'systems', 'solutions', 'agency',
        'consulting', 'services', 'group', 'associates'
    ]
    
    # Pattern: "Job Title at Company" or "Job Title @ Company"
    if re.search(r'.+\s+(?:at|@)\s+.+', text, re.IGNORECASE):
        return True
    
    # Pattern: "Company | Job Title" or "Job Title | Company"
    if '|' in text or 'â€"' in text or 'â€"' in text:
        return True
    
    # Check if it contains job title words
    if any(indicator in text_lower for indicator in job_title_indicators):
        return True
    
    # Check if it contains company indicators
    if any(indicator in text_lower for indicator in company_indicators):
        return True
    
    # Check for all caps company names (common in CVs)
    if re.match(r'^[A-Z][A-Z\s&.,]+', text) and len(text.split()) <= 5:
        return True
    
    return False

def create_experience_entry(header_text):
    """Create a new experience entry and parse title/company from header"""
    entry = {
        "company": None,
        "title": None,
        "location": None,
        "description": None
    }
    
    # Parse title and company from header
    title, company = parse_title_company(header_text)
    entry["title"] = title
    entry["company"] = company
    
    return entry

def parse_title_company(text):
    """Parse job title and company from a header line"""
    if not text:
        return None, None
    
    # Remove dates first to avoid confusion
    clean_text = re.sub(r'\b\d{4}\s*[-â€"â€"]\s*(\d{4}|present|current)\b', '', text, flags=re.IGNORECASE)
    month_pattern = r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}\b'
    clean_text = re.sub(month_pattern, '', clean_text, flags=re.IGNORECASE)
    clean_text = ' '.join(clean_text.split()).strip()
    
    # Pattern 1: "Job Title at Company Name"
    match = re.search(r'^(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[|\-â€"â€"]|$)', clean_text, re.IGNORECASE)
    if match:
        title = match.group(1).strip()
        company = match.group(2).strip()
        return clean_title_name(title), clean_company_name(company)
    
    # Pattern 2: "Company | Job Title" or "Job Title | Company"
    separators = ['|', 'â€"', 'â€"', '-']
    for sep in separators:
        if sep in clean_text:
            parts = [part.strip() for part in clean_text.split(sep, 1)]
            if len(parts) == 2:
                part1, part2 = parts
                
                # Determine which is company and which is title
                company_indicators = ['inc', 'corp', 'ltd', 'llc', 'company', 'technologies', 'systems', 'solutions']
                title_indicators = ['engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator', 'intern']
                
                part1_lower = part1.lower()
                part2_lower = part2.lower()
                
                # If part1 has company indicators or part2 has title indicators
                if (any(ind in part1_lower for ind in company_indicators) or 
                    any(ind in part2_lower for ind in title_indicators)):
                    return clean_title_name(part2), clean_company_name(part1)
                else:
                    # Default: assume first part is title, second is company
                    return clean_title_name(part1), clean_company_name(part2)
    
    # Pattern 3: Single line - try to determine if it's a title or company
    title_indicators = ['engineer', 'developer', 'manager', 'analyst', 'intern', 'assistant', 'head', 'lead']
    if any(word in clean_text.lower() for word in title_indicators):
        return clean_title_name(clean_text), None
    else:
        return None, clean_company_name(clean_text)

def clean_title_name(title):
    """Clean job title"""
    if not title:
        return None
    return ' '.join(title.split()).strip()

def clean_company_name(company):
    """Clean company name"""
    if not company:
        return None
    return ' '.join(company.split()).strip()

def extract_location_from_line(line):
    """Extract location information from a line"""
    if not line:
        return None
    
    # Pattern: City, State or City, Country
    location_patterns = [
        r'(.+?),\s*([A-Z]{2}|[A-Z][a-z]+)(?:\s*,\s*[A-Z]{2,3})?',
        r'(Remote|Work from home|WFH)',
        r'(.+?),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            if 'remote' in line.lower() or 'wfh' in line.lower():
                return "Remote"
            else:
                return line.strip()
    
    return None

def is_redundant_line(line, entry):
    """Check if line is redundant (already captured in title/company)"""
    if not line or not entry:
        return False
    
    line_lower = line.lower()
    
    # Check against title
    if entry.get("title"):
        title_lower = entry["title"].lower()
        if line_lower == title_lower or line_lower in title_lower:
            return True
    
    # Check against company
    if entry.get("company"):
        company_lower = entry["company"].lower()
        if line_lower == company_lower or line_lower in company_lower:
            return True
    
    return False

def main():
    try:
        if len(sys.argv) < 2:
            error_result = {"error": "missing file path", "parserVersion": "cvp-1.0.0"}
            print(json.dumps(error_result))
            sys.exit(2)

        path = sys.argv[1]
        print(f"Processing file: {path}", file=sys.stderr)

        # Extract text with enhanced error handling
        try:
            logger.info(f"Starting text extraction from: {path}")
            text = read_file_text(path)
            text = normalize_text(text)  # <<=== normalize raw text immediately
            logger.info(f"Text extraction successful: {len(text)} characters extracted")
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            error_result = {
                "error": f"Text extraction failed: {str(e)}",
                "parserVersion": "cvp-1.0.0",
                "parsedAt": datetime.utcnow().isoformat() + "Z"
            }
            print(json.dumps(error_result))
            sys.exit(1)

        # Validate extracted text
        is_valid, validation_msg = validate_extracted_text(text)
        if not is_valid:
            logger.warning(f"Text validation warning: {validation_msg}")
        else:
            logger.info("Text validation passed")

        # Extract information with error handling
        try:
            logger.info("Starting data extraction")

            email = find_email(text)
            logger.debug(f"Email extraction: {email}")

            phone = find_phone(text)
            logger.debug(f"Phone extraction: {phone}")

            links = find_links(text)
            logger.debug(f"Links extraction: {len(links)} links found")

            name = guess_name(text)
            logger.debug(f"Name extraction: {name}")

            skills = extract_skills(text)
            logger.debug(f"Skills extraction: {len(skills)} skills found")

            sections = split_sections(text)
            logger.debug(f"Section splitting: {list(sections.keys())}")

            edu = extract_education(sections.get("education", ""))
            logger.debug(f"Education extraction: {len(edu)} entries found")

            exp = extract_experience(
                sections.get("experience", "") or sections.get("work experience", "") or ""
            )
            logger.debug(f"Experience extraction: {len(exp)} entries found")

            summary = extract_summary(text, sections)
            certs = extract_certifications(sections)

            logger.info(
                f"Data extraction completed - Name: {name}, Email: {email}, "
                f"Skills: {len(skills)}, Education: {len(edu)}, Experience: {len(exp)}"
            )

        except Exception as e:
            logger.error(f"Data extraction failed: {str(e)}", exc_info=True)
            error_result = {
                "error": f"Data extraction failed: {str(e)}",
                "parserVersion": "cvp-1.0.0",
                "parsedAt": datetime.utcnow().isoformat() + "Z"
            }
            print(json.dumps(error_result))
            sys.exit(1)

        # Calculate confidence score
        confidence_factors = {
            'name_found': bool(name),
            'email_found': bool(email),
            'phone_found': bool(phone),
            'skills_found': bool(skills and len(skills) > 0),
            'education_found': bool(edu and len(edu) > 0),
            'experience_found': bool(exp and len(exp) > 0),
            'text_valid': is_valid
        }

        base_confidence = 0.3
        confidence = base_confidence + (0.1 * sum(confidence_factors.values()))
        confidence = round(min(1.0, confidence), 2)

        logger.info(f"Confidence calculation: {confidence} (factors: {confidence_factors})")

        # Build result with data cleaning and proper defaults
        logger.info("Building final result")

        # Format education entries
        formatted_education = []
        for edu_item in edu:
            formatted_edu = {
                "institution": clean_text_field(edu_item.get('institution'), 200),
                "degree": clean_text_field(edu_item.get('degree'), 200),
                "field": clean_text_field(edu_item.get('field'), 200),
                "grade": clean_text_field(edu_item.get('grade'), 50)
            }
            formatted_education.append(formatted_edu)

        # Format experience entries
        formatted_experience = []
        for exp_item in exp:
            formatted_exp = {
                "company": clean_text_field(exp_item.get('company'), 200),
                "title": clean_text_field(exp_item.get('title'), 200),
                "location": clean_text_field(exp_item.get('location'), 200),
                "description": clean_text_field(exp_item.get('description'), 2000)
            }
            formatted_experience.append(formatted_exp)

        result = {
            "name": clean_text_field(name, 100),
            "email": email,
            "phone": clean_text_field(phone, 50),
            "location": None,  # Not currently extracted
            "links": links[:20],
            "skills": [s.title() for s in skills[:100]],  # Title case for consistency
            "summary": clean_text_field(summary, 1000),
            "education": formatted_education,
            "experience": formatted_experience,
            "certifications": certs,
            "languages": [],  # Not currently extracted
            "rawText": text[:200000],  # cap raw text size
            "confidence": confidence,
            "parserVersion": "cvp-1.0.0",
            "parsedAt": datetime.utcnow().isoformat() + "Z"
        }

        logger.info(f"Parsing completed successfully with confidence: {confidence}")
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)

    except Exception as e:
        # Catch-all error handler
        logger.error(f"Unexpected error during parsing: {str(e)}", exc_info=True)
        error_result = {
            "error": f"Unexpected error: {str(e)}",
            "parserVersion": "cvp-1.0.0",
            "parsedAt": datetime.utcnow().isoformat() + "Z",
            "confidence": confidence
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()