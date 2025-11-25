// In-memory storage for password reset verification codes
// Each entry: { email, code, expiresAt, attempts, lastRequestTime }

const verificationCodes = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const CODE_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_EMAIL = 3;

// Generate a random 6-digit code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification code for an email
const storeVerificationCode = (email) => {
    const now = Date.now();
    const existingEntry = verificationCodes.get(email.toLowerCase());

    // Check rate limiting
    if (existingEntry && existingEntry.lastRequestTime) {
        const timeSinceLastRequest = now - existingEntry.lastRequestTime;
        if (timeSinceLastRequest < RATE_LIMIT_WINDOW && existingEntry.attempts >= MAX_ATTEMPTS_PER_EMAIL) {
            const timeRemaining = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastRequest) / 1000 / 60);
            return {
                success: false,
                error: `Too many attempts. Please try again in ${timeRemaining} minute${timeRemaining > 1 ? 's' : ''}.`
            };
        }
    }

    const code = generateCode();
    const expiresAt = now + CODE_EXPIRY_TIME;

    verificationCodes.set(email.toLowerCase(), {
        code,
        expiresAt,
        attempts: existingEntry ? existingEntry.attempts + 1 : 1,
        lastRequestTime: now,
        verified: false
    });

    console.log(`[Verification Code] Generated for ${email}: ${code} (expires in 15 minutes)`);

    return {
        success: true,
        code,
        expiresAt
    };
};

// Verify a code for an email
const verifyCode = (email, code) => {
    const entry = verificationCodes.get(email.toLowerCase());

    if (!entry) {
        return {
            valid: false,
            error: 'No verification code found. Please request a new code.'
        };
    }

    const now = Date.now();

    // Check if code has expired
    if (now > entry.expiresAt) {
        verificationCodes.delete(email.toLowerCase());
        return {
            valid: false,
            error: 'Verification code has expired. Please request a new one.'
        };
    }

    // Check if code matches
    if (entry.code !== code) {
        return {
            valid: false,
            error: 'Invalid verification code. Please try again.'
        };
    }

    // Mark as verified
    entry.verified = true;
    verificationCodes.set(email.toLowerCase(), entry);

    console.log(`[Verification Code] Successfully verified for ${email}`);

    return {
        valid: true,
        message: 'Code verified successfully'
    };
};

// Check if email has a verified code (for password reset)
const hasVerifiedCode = (email) => {
    const entry = verificationCodes.get(email.toLowerCase());
    if (!entry) return false;

    const now = Date.now();
    // Check if verified and not expired
    return entry.verified && now <= entry.expiresAt;
};

// Clear verification code for an email
const clearVerificationCode = (email) => {
    verificationCodes.delete(email.toLowerCase());
    console.log(`[Verification Code] Cleared for ${email}`);
};

// Auto-cleanup expired codes every 5 minutes
setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [email, entry] of verificationCodes.entries()) {
        if (now > entry.expiresAt) {
            verificationCodes.delete(email);
            cleanedCount++;
        }
    }

    if (cleanedCount > 0) {
        console.log(`[Verification Code] Auto-cleanup: Removed ${cleanedCount} expired code(s)`);
    }
}, 5 * 60 * 1000); // Run every 5 minutes

module.exports = {
    generateCode,
    storeVerificationCode,
    verifyCode,
    hasVerifiedCode,
    clearVerificationCode
};
