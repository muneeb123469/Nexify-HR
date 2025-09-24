import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 90vw;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
  
  @media (min-width: 480px) {
    max-width: 450px;
    padding: 2rem;
  }
  
  @media (min-width: 768px) {
    max-width: 520px;
    padding: 2.5rem;
    border-radius: 16px;
  }
  
  @media (min-width: 1024px) {
    max-width: 580px;
    padding: 3rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  @media (min-width: 768px) {
    margin-bottom: 2rem;
    gap: 1.5rem;
  }
`;

const WarningIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
  
  @media (min-width: 768px) {
    top: 1.5rem;
    right: 1.5rem;
    font-size: 1.75rem;
    padding: 0.75rem;
    border-radius: 8px;
  }
`;

const JobTitle = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid #dc3545;
  
  @media (min-width: 768px) {
    padding: 1.25rem;
    border-radius: 10px;
    margin: 1.5rem 0;
  }
`;

const JobTitleText = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const WarningText = styled.p`
  color: #333;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  
  @media (min-width: 768px) {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

const WarningList = styled.ul`
  margin: 1rem 0 1.5rem 0;
  padding-left: 1.5rem;
  color: #666;
  line-height: 1.5;
  
  @media (min-width: 768px) {
    margin: 1.5rem 0 2rem 0;
    line-height: 1.6;
  }
`;

const WarningItem = styled.li`
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }
`;

const ConfirmationSection = styled.div`
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  
  @media (min-width: 768px) {
    margin: 2rem 0;
    padding: 1.5rem;
    border-radius: 10px;
  }
`;

const ConfirmationText = styled.p`
  margin: 0 0 1rem 0;
  color: #856404;
  font-weight: 500;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ConfirmationInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: monospace;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
  }
  
  &.valid {
    border-color: #28a745;
    background: #f8fff9;
  }
  
  &.invalid {
    border-color: #dc3545;
    background: #fff5f5;
  }
  
  @media (min-width: 768px) {
    padding: 0.875rem;
    border-radius: 8px;
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  flex-direction: column;
  
  @media (min-width: 480px) {
    flex-direction: row;
    gap: 1rem;
  }
  
  @media (min-width: 768px) {
    margin-top: 2rem;
    gap: 1.25rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-height: 44px;
  
  @media (min-width: 768px) {
    padding: 0.875rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    min-height: 48px;
  }

  &.cancel {
    background: #f1f3f4;
    color: #333;
    order: 2;

    &:hover {
      background: #e8eaed;
      transform: translateY(-1px);
    }
    
    @media (min-width: 480px) {
      order: 1;
    }
  }

  &.delete {
    background: #dc3545;
    color: white;
    order: 1;

    &:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }
    
    @media (min-width: 480px) {
      order: 2;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const DeleteJobModal = ({ isOpen, onClose, job, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isConfirmValid = confirmText === 'DELETE';

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
    
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText('');
      onClose();
    }
  };

  const handleInputChange = (e) => {
    setConfirmText(e.target.value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <CloseButton onClick={handleClose} disabled={loading}>×</CloseButton>
            
            <ModalHeader>
              <WarningIcon>!</WarningIcon>
              <ModalTitle>Delete Job Permanently</ModalTitle>
            </ModalHeader>

            <JobTitle>
              <JobTitleText>{job?.title}</JobTitleText>
            </JobTitle>

            <WarningText>
              <strong>This action cannot be undone.</strong> Deleting this job will permanently:
            </WarningText>

            <WarningList>
              <WarningItem>Remove the job from the database</WarningItem>
              <WarningItem>Delete all associated applications</WarningItem>
              <WarningItem>Remove it from all job listings</WarningItem>
              <WarningItem>Make it inaccessible to all users</WarningItem>
            </WarningList>

            <ConfirmationSection>
              <ConfirmationText>
                To confirm deletion, type <strong>DELETE</strong> in the field below:
              </ConfirmationText>
              <ConfirmationInput
                type="text"
                value={confirmText}
                onChange={handleInputChange}
                placeholder="Type DELETE here"
                className={confirmText ? (isConfirmValid ? 'valid' : 'invalid') : ''}
                disabled={loading}
              />
            </ConfirmationSection>

            <ButtonGroup>
              <Button 
                type="button" 
                className="cancel" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="delete" 
                onClick={handleConfirm}
                disabled={!isConfirmValid || loading}
              >
                {loading && <LoadingSpinner />}
                {loading ? 'Deleting...' : 'Delete Job'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default DeleteJobModal;