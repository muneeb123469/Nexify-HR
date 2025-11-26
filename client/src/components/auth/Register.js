import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import {
  AuthContainer,
  FormContainer,
  Title,
  FormGroup,
  Label,
  Input,
  Select,
  Button,
  ErrorMessage,
  Link,
  Form,
  PasswordInput,
  PasswordToggle,
  InputIcon,
  LoadingSpinner,
  CheckboxGroup,
  Checkbox,
  CheckboxLabel,
  ValidationMessage,
  pageVariants,
  pageTransition
} from './styles';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1 = registration form, 2 = code verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'applicant'
  });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      criteria: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  };

  const validateEmail = (email) => {
    if (!email) {
      return {
        isValid: false,
        criteria: {
          hasAtSymbol: false,
          hasLocalPart: false,
          hasDomain: false,
          validLocalPartLength: false,
          noConsecutivePeriods: false,
          noStartEndPeriod: false,
          validDomainFormat: false,
          validTLD: false
        }
      };
    }

    // Check for @ symbol
    const hasAtSymbol = email.includes('@') && email.split('@').length === 2;

    if (!hasAtSymbol) {
      return {
        isValid: false,
        criteria: {
          hasAtSymbol: false,
          hasLocalPart: false,
          hasDomain: false,
          validLocalPartLength: false,
          noConsecutivePeriods: false,
          noStartEndPeriod: false,
          validDomainFormat: false,
          validTLD: false
        }
      };
    }

    const [localPart, domainPart] = email.split('@');

    // Check if local part and domain exist
    const hasLocalPart = localPart && localPart.length > 0;
    const hasDomain = domainPart && domainPart.length > 0;

    // Check local part length (max 64 characters)
    const validLocalPartLength = localPart && localPart.length <= 64;

    // Check for consecutive periods in local part
    const noConsecutivePeriods = localPart && !localPart.includes('..');

    // Check local part doesn't start or end with period
    const noStartEndPeriod = localPart && !localPart.startsWith('.') && !localPart.endsWith('.');

    // Check local part contains only valid characters (letters, digits, periods, underscores)
    const validLocalPartChars = localPart && /^[a-zA-Z0-9._]+$/.test(localPart);

    // Check domain format (must have at least one period, no hyphens at start/end)
    const hasDomainPeriod = domainPart && domainPart.includes('.');
    const domainParts = domainPart ? domainPart.split('.') : [];

    // Check domain doesn't start or end with hyphen, and has valid characters
    const validDomainFormat = domainPart && hasDomainPeriod &&
      domainParts.every(part => {
        return part.length > 0 &&
          !part.startsWith('-') &&
          !part.endsWith('-') &&
          /^[a-zA-Z0-9-]+$/.test(part);
      });

    // Check TLD is alphabetic only (last part after final period)
    const tld = domainParts.length > 0 ? domainParts[domainParts.length - 1] : '';
    const validTLD = tld && /^[a-zA-Z]+$/.test(tld) && tld.length >= 2;

    const allValid = hasAtSymbol && hasLocalPart && hasDomain &&
      validLocalPartLength && noConsecutivePeriods &&
      noStartEndPeriod && validLocalPartChars &&
      validDomainFormat && validTLD;

    return {
      isValid: allValid,
      criteria: {
        hasAtSymbol,
        hasLocalPart,
        hasDomain,
        validLocalPartLength,
        noConsecutivePeriods,
        noStartEndPeriod,
        validDomainFormat,
        validTLD
      }
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle code input
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError('Password does not meet the requirements');
      return;
    }

    setLoading(true);

    try {
      // Send registration data and get verification code sent to email
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Move to step 2 (verification)
      setStep(2);
      setResendCooldown(60); // 60 second cooldown
      setError(null);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);

    const codeString = verificationCode.join('');
    if (codeString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: codeString
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Login with the returned token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to appropriate dashboard
      switch (data.user.role) {
        case 'hr':
          navigate('/dashboard');
          break;
        case 'employee':
          navigate('/employee-dashboard');
          break;
        case 'applicant':
          navigate('/applicant-dashboard');
          break;
        default:
          navigate('/applicant-dashboard');
      }

    } catch (err) {
      setError(err.message);
      setVerificationCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-registration-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      setVerificationCode(['', '', '', '', '', '']);
      setResendCooldown(60);
      document.getElementById('code-0')?.focus();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);
  const emailValidation = validateEmail(formData.email);

  return (
    <AuthContainer>
      <FormContainer
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Title>{step === 1 ? 'Create Account' : 'Verify Your Email'}</Title>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </ErrorMessage>
        )}

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Full Name</Label>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <InputIcon>
                <FaEnvelope />
              </InputIcon>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
              <ValidationMessage>
                <div>
                  {emailValidation.criteria.hasAtSymbol ? <FaCheck /> : <FaTimes />}
                  Contains @ symbol
                </div>
                <div>
                  {emailValidation.criteria.hasLocalPart && emailValidation.criteria.hasDomain ? <FaCheck /> : <FaTimes />}
                  Has local and domain parts
                </div>
                <div>
                  {emailValidation.criteria.validLocalPartLength ? <FaCheck /> : <FaTimes />}
                  Local part ≤ 64 characters
                </div>
                <div>
                  {emailValidation.criteria.noConsecutivePeriods ? <FaCheck /> : <FaTimes />}
                  No consecutive periods
                </div>
                <div>
                  {emailValidation.criteria.noStartEndPeriod ? <FaCheck /> : <FaTimes />}
                  No period at start/end
                </div>
                <div>
                  {emailValidation.criteria.validDomainFormat ? <FaCheck /> : <FaTimes />}
                  Valid domain format
                </div>
                <div>
                  {emailValidation.criteria.validTLD ? <FaCheck /> : <FaTimes />}
                  Valid TLD (alphabetic only)
                </div>
              </ValidationMessage>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <PasswordInput>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </PasswordInput>
              <ValidationMessage>
                <div>
                  {passwordValidation.criteria.minLength ? <FaCheck /> : <FaTimes />}
                  At least 8 characters
                </div>
                <div>
                  {passwordValidation.criteria.hasUpperCase ? <FaCheck /> : <FaTimes />}
                  One uppercase letter
                </div>
                <div>
                  {passwordValidation.criteria.hasLowerCase ? <FaCheck /> : <FaTimes />}
                  One lowercase letter
                </div>
                <div>
                  {passwordValidation.criteria.hasNumbers ? <FaCheck /> : <FaTimes />}
                  One number
                </div>
                <div>
                  {passwordValidation.criteria.hasSpecialChar ? <FaCheck /> : <FaTimes />}
                  One special character
                </div>
              </ValidationMessage>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </PasswordInput>
            </FormGroup>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={loading}
              />
              <CheckboxLabel htmlFor="terms">
                I agree to the Terms & Conditions and Privacy Policy
              </CheckboxLabel>
            </CheckboxGroup>
            <Button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  Creating Account...
                  <LoadingSpinner />
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            <Link href="/">Already have an account? Sign in</Link>
          </Form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <Form onSubmit={handleVerifyCode}>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
              We've sent a 6-digit verification code to <strong>{formData.email}</strong>
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  disabled={loading}
                  autoComplete="off"
                  style={{
                    width: '50px',
                    height: '50px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    backgroundColor: loading ? '#f5f5f5' : 'white',
                    cursor: loading ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                  }}
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  Verifying...
                  <LoadingSpinner />
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <Button
              type="button"
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
              style={{ marginTop: '10px', background: resendCooldown > 0 ? '#999' : '#667eea' }}
              whileHover={{ scale: resendCooldown > 0 ? 1 : 1.02 }}
              whileTap={{ scale: resendCooldown > 0 ? 1 : 0.98 }}
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
            </Button>

            <Button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              style={{ marginTop: '10px', background: '#6c757d' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Registration
            </Button>
          </Form>
        )}
      </FormContainer>
    </AuthContainer>
  );
};
export default Register;