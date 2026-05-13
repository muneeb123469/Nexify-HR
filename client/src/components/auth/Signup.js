import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaBuilding, FaBriefcase } from 'react-icons/fa';
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
  pageVariants,
  pageTransition
} from './styles';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'applicant',
    company: '',
    position: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      checks: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
      const userData = await register({
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      switch (userData.role) {
        case 'hr':
          navigate('/hr/dashboard');
          break;
        case 'employee':
          navigate('/employee-dashboard');
          break;
        case 'applicant':
          navigate('/applicant-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/applicant-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <AuthContainer>
      <FormContainer
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Title>Join Us</Title>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </ErrorMessage>
        )}

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

          <FormGroup>
            <Label htmlFor="role">Role</Label>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="applicant">Applicant</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="company">Company</Label>
            <InputIcon>
              <FaBuilding />
            </InputIcon>
            <Input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter your company name"
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="position">Position</Label>
            <InputIcon>
              <FaBriefcase />
            </InputIcon>
            <Input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Enter your position"
              disabled={loading}
            />
          </FormGroup>

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

          <Link href="/login">Already have an account? Sign in</Link>
        </Form>
      </FormContainer>
    </AuthContainer>
  );
};

export default Signup;
