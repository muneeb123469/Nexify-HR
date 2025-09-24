import React, { useState, useEffect } from 'react';
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
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
  }
`;

const ArrayInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ArrayItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #c82333;
  }
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #218838;
  }
`;

const SalaryGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &.primary {
    background: #1a73e8;
    color: white;

    &:hover {
      background: #1557b0;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: #f1f3f4;
    color: #333;

    &:hover {
      background: #e8eaed;
    }
  }
`;

const EditJobModal = ({ isOpen, onClose, job, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    department: '',
    employmentType: 'Full-time',
    closingDate: '',
    requirements: [''],
    responsibilities: [''],
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        department: job.department || '',
        employmentType: job.employmentType || 'Full-time',
        closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split('T')[0] : '',
        requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
        responsibilities: job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [''],
        salary: {
          min: job.salary?.min || '',
          max: job.salary?.max || '',
          currency: job.salary?.currency || 'USD'
        },
        status: job.status || 'active'
      });
    }
  }, [job]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const salaryField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: salaryField === 'min' || salaryField === 'max' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (arrayName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
        closingDate: formData.closingDate || null
      };
      
      await onSave(cleanedData);
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <ModalHeader>
              <ModalTitle>Edit Job</ModalTitle>
              <CloseButton onClick={onClose}>×</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Job Title *</Label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Description *</Label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Location *</Label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Department *</Label>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Project">Project</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Employment Type</Label>
                <Select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Closing Date</Label>
                <Input
                  type="date"
                  name="closingDate"
                  value={formData.closingDate}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Salary</Label>
                <SalaryGroup>
                  <div>
                    <Label>Min Salary *</Label>
                    <Input
                      type="number"
                      name="salary.min"
                      value={formData.salary.min}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>Max Salary *</Label>
                    <Input
                      type="number"
                      name="salary.max"
                      value={formData.salary.max}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select
                      name="salary.currency"
                      value={formData.salary.currency}
                      onChange={handleInputChange}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="PKR">PKR</option>
                    </Select>
                  </div>
                </SalaryGroup>
              </FormGroup>

              <FormGroup>
                <Label>Requirements *</Label>
                <ArrayInput>
                  {formData.requirements.map((requirement, index) => (
                    <ArrayItem key={index}>
                      <Input
                        type="text"
                        value={requirement}
                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                        placeholder="Enter requirement"
                      />
                      {formData.requirements.length > 1 && (
                        <RemoveButton
                          type="button"
                          onClick={() => removeArrayItem('requirements', index)}
                        >
                          Remove
                        </RemoveButton>
                      )}
                    </ArrayItem>
                  ))}
                  <AddButton
                    type="button"
                    onClick={() => addArrayItem('requirements')}
                  >
                    Add Requirement
                  </AddButton>
                </ArrayInput>
              </FormGroup>

              <FormGroup>
                <Label>Responsibilities *</Label>
                <ArrayInput>
                  {formData.responsibilities.map((responsibility, index) => (
                    <ArrayItem key={index}>
                      <Input
                        type="text"
                        value={responsibility}
                        onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                        placeholder="Enter responsibility"
                      />
                      {formData.responsibilities.length > 1 && (
                        <RemoveButton
                          type="button"
                          onClick={() => removeArrayItem('responsibilities', index)}
                        >
                          Remove
                        </RemoveButton>
                      )}
                    </ArrayItem>
                  ))}
                  <AddButton
                    type="button"
                    onClick={() => addArrayItem('responsibilities')}
                  >
                    Add Responsibility
                  </AddButton>
                </ArrayInput>
              </FormGroup>

              <ButtonGroup>
                <Button type="button" className="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default EditJobModal;
