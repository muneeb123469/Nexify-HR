// In-memory storage for temporary registration data
// Each entry: { email, username, password, code, expiresAt, attempts, lastRequestTime }

const pendingRegistrations = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const CODE_EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_EMAIL = 3;

// Generate a random 6-digit code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store temporary registration data with verification code
const storeRegistration = (email, username, password) => {
    const now = Date.now();
    const existingEntry = pendingRegistrations.get(email.toLowerCase());

    // Check rate limiting
    if (existingEntry && existingEntry.lastRequestTime) {
        const timeSinceLastRequest = now - existingEntry.lastRequestTime;
        if (timeSinceLastRequest < RATE_LIMIT_WINDOW && existingEntry.attempts >= MAX_ATTEMPTS_PER_EMAIL) {
            const timeRemaining = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastRequest) / 1000 / 60);
            return {
                success: false,
                error: `Too many registration attempts. Please try again in ${timeRemaining} minute${timeRemaining > 1 ? 's' : ''}.`
            };
        }
    }

    const code = generateCode();
    const expiresAt = now + CODE_EXPIRY_TIME;

    pendingRegistrations.set(email.toLowerCase(), {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password, // Store as-is (plain text as per your system)
        code,
        expiresAt,
        attempts: existingEntry ? existingEntry.attempts + 1 : 1,
        lastRequestTime: now,
        verified: false
    });

    console.log(`[Registration] Code generated for ${email}: ${code} (expires in 15 minutes)`);

    return {
        success: true,
        code,
        expiresAt
    };
};

// Verify registration code
const verifyRegistrationCode = (email, code) => {
    const entry = pendingRegistrations.get(email.toLowerCase());

    if (!entry) {
        return {
            valid: false,
            error: 'No pending registration found. Please register again.'
        };
    }

    const now = Date.now();

    // Check if code has expired
    if (now > entry.expiresAt) {
        pendingRegistrations.delete(email.toLowerCase());
        return {
            valid: false,
            error: 'Verification code has expired. Please register again.'
        };
    }

    // Check if code matches
    if (entry.code !== code) {
        return {
            valid: false,
            error: 'Code does not match. Please try again.'
        };
    }

    // Mark as verified
    entry.verified = true;
    pendingRegistrations.set(email.toLowerCase(), entry);

    console.log(`[Registration] Code verified successfully for ${email}`);

    return {
        valid: true,
        registrationData: {
            email: entry.email,
            username: entry.username,
            password: entry.password
        }
    };
};

// Get registration data for verified email
const getVerifiedRegistration = (email) => {
    const entry = pendingRegistrations.get(email.toLowerCase());

    if (!entry || !entry.verified) {
        return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
        pendingRegistrations.delete(email.toLowerCase());
        return null;
    }

    return {
        email: entry.email,
        username: entry.username,
        password: entry.password
    };
};

// Clear registration data after account creation
const clearRegistration = (email) => {
    pendingRegistrations.delete(email.toLowerCase());
    console.log(`[Registration] Cleared pending registration for ${email}`);
};

// Get registration data (without verification check) for resending code
const getRegistrationData = (email) => {
    return pendingRegistrations.get(email.toLowerCase());
};

// Auto-cleanup expired registrations every 5 minutes
setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [email, entry] of pendingRegistrations.entries()) {
        if (now > entry.expiresAt) {
            pendingRegistrations.delete(email);
            cleanedCount++;
        }
    }

    if (cleanedCount > 0) {
        console.log(`[Registration] Auto-cleanup: Removed ${cleanedCount} expired registration(s)`);
    }
}, 5 * 60 * 1000); // Run every 5 minutes

module.exports = {
    generateCode,
    storeRegistration,
    verifyRegistrationCode,
    getVerifiedRegistration,
    clearRegistration,
    getRegistrationData
};
