import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

// Colors
const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  error: '#f44336',
  success: '#4CAF50',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999'
  },
  border: '#E0E0E0',
  background: {
    light: '#F5F5F5',
    white: '#FFFFFF'
  }
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Container styles
export const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.background.light} 0%, ${colors.background.white} 100%);
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

export const FormContainer = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background: ${colors.background.white};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.3s ease-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 0.5rem;
    border-radius: 8px;
  }
`;

// Typography
export const Title = styled.h1`
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: ${colors.text.primary};
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
  animation: ${slideUp} 0.3s ease-out;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

// Form elements
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  color: ${colors.text.secondary};
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: ${colors.background.white};
  padding-left: 2.5rem;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  }

  &:disabled {
    background: ${colors.background.light};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${colors.text.light};
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem 0.875rem 2.5rem;
    font-size: 16px; // Prevents zoom on iOS
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.text.light};
  pointer-events: none;
`;

export const PasswordInput = styled.div`
  position: relative;
  width: 100%;

  input {
    padding-right: 2.5rem;
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${colors.text.secondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.text.primary};
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: ${colors.background.white};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  padding-right: 2.5rem;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  }

  &:disabled {
    background: ${colors.background.light};
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 16px;
  }
`;

export const Button = styled(motion.button)`
  width: 100%;
  padding: 0.875rem;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:disabled {
    background: ${colors.text.light};
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1.1rem;
  }
`;

export const LoadingSpinner = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 0.8s linear infinite;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
`;

export const ErrorMessage = styled(motion.div)`
  color: ${colors.error};
  font-size: 0.875rem;
  padding: 0.75rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.875rem;
  }
`;

export const Link = styled.a`
  color: ${colors.secondary};
  text-decoration: none;
  font-size: 0.875rem;
  text-align: center;
  transition: color 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    color: ${colors.primary};
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-top: 0.75rem;
  }
`;

export const ForgotPasswordLink = styled(Link)`
  color: ${colors.text.secondary};
  font-size: 0.8rem;
  margin-top: -0.5rem;
  align-self: flex-end;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colors.background.light};
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

export const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:checked {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
  }

  @media (max-width: 768px) {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

export const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: ${colors.text.secondary};
  cursor: pointer;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const ValidationMessage = styled.div`
  font-size: 0.75rem;
  color: ${props => props.isValid ? colors.success : colors.error};
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  animation: ${slideUp} 0.2s ease-out;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const Accordion = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 8px;
  margin-top: 1rem;
  overflow: hidden;
`;

export const AccordionHeader = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${colors.background.light};
  border: none;
  text-align: left;
  font-weight: 500;
  color: ${colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${colors.border};
  }
`;

export const AccordionContent = styled.div`
  padding: ${props => props.isOpen ? '1rem' : '0'};
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

// Animation variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -20
  }
};

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
}; 