import React, { useState, useEffect } from 'react';
import './TwoFactorAuth.css';

const TwoFactorAuth = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a complete 6-digit code');
      return;
    }

    try {
      // Here you would typically make an API call to verify the OTP
      // For demo purposes, we'll simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Verification successful! Redirecting...');
      // Redirect or update authentication state here
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setCanResend(false);
    setTimer(30);
    setOtp(['', '', '', '', '', '']);

    try {
      // Here you would typically make an API call to resend the OTP
      // For demo purposes, we'll simulate a successful resend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('New verification code sent!');
    } catch (err) {
      setError('Failed to send new code. Please try again.');
    }
  };

  return (
    <div className="two-factor-auth">
      <div className="auth-container">
        <h1>Two-Factor Authentication</h1>
        <p className="auth-instructions">
          Please enter the 6-digit verification code sent to your email/phone.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                name={`otp-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                pattern="\d*"
                inputMode="numeric"
                autoComplete="off"
                required
              />
            ))}
          </div>

          <button type="submit" className="verify-button">
            Verify Code
          </button>
        </form>

        <div className="resend-section">
          {!canResend ? (
            <p className="timer">
              Resend code in <span>{timer}</span> seconds
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              className="resend-button"
              disabled={!canResend}
            >
              Resend Code
            </button>
          )}
        </div>

        <div className="security-notice">
          <h3>Security Notice</h3>
          <ul>
            <li>Keep your verification code secure and do not share it with anyone.</li>
            <li>The code will expire in 5 minutes.</li>
            <li>If you didn't request this code, please contact support immediately.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth; 