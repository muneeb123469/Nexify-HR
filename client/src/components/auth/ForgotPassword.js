import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [expiresInMinutes, setExpiresInMinutes] = useState(15);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Countdown timer for code expiration
    useEffect(() => {
        if (step === 2 && expiresInMinutes > 0) {
            const timer = setInterval(() => {
                setExpiresInMinutes((prev) => (prev > 0 ? prev - 1 : 0));
            }, 60000); // Update every minute

            return () => clearInterval(timer);
        }
    }, [step, expiresInMinutes]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Step 1: Send verification code
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send verification code');
            }

            setSuccess(data.message);
            setExpiresInMinutes(data.expiresInMinutes || 15);
            setResendCooldown(60); // 60 second cooldown for resend
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle code input
    const handleCodeChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Handle backspace
    const handleCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // Step 2: Verify code
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const codeString = code.join('');
        if (codeString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: codeString })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid verification code');
            }

            setSuccess('Code verified! Please enter your new password.');
            setTimeout(() => setStep(3), 1000);
        } catch (err) {
            setError(err.message);
            setCode(['', '', '', '', '', '']);
            document.getElementById('code-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Resend code
    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        setCode(['', '', '', '', '', '']);
        await handleSendCode({ preventDefault: () => { } });
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                {/* Header */}
                <div className="forgot-password-header">
                    <h1>🔐 Reset Password</h1>
                    <div className="step-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
                        <div className="step-line"></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
                    </div>
                    <p className="step-description">
                        {step === 1 && 'Enter your email address'}
                        {step === 2 && 'Enter verification code'}
                        {step === 3 && 'Create new password'}
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && <div className="message error-message">{error}</div>}
                {success && <div className="message success-message">{success}</div>}

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <form onSubmit={handleSendCode} className="forgot-password-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate('/login')}
                            disabled={loading}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                {/* Step 2: Code Verification */}
                {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="forgot-password-form">
                        <p className="info-text">
                            We've sent a 6-digit verification code to <strong>{email}</strong>
                        </p>

                        <div className="code-input-group">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                    className="code-input"
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        {expiresInMinutes > 0 && (
                            <p className="expiry-notice">
                                ⏰ Code expires in {expiresInMinutes} minute{expiresInMinutes !== 1 ? 's' : ''}
                            </p>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleResendCode}
                            disabled={loading || resendCooldown > 0}
                        >
                            {resendCooldown > 0
                                ? `Resend Code (${resendCooldown}s)`
                                : 'Resend Code'}
                        </button>

                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => {
                                setStep(1);
                                setCode(['', '', '', '', '', '']);
                            }}
                            disabled={loading}
                        >
                            Change Email
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="forgot-password-form">
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength="6"
                                disabled={loading}
                            />
                            <small>Must be at least 6 characters</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
