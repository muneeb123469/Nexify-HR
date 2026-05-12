import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1557b0;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #c5221f;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const Actions = styled.div`
  display: flex;
  gap: ${0.75}rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #718096;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #4a5568;
  }
`;

const JobForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createJob, updateJob, jobs } = useJobs();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    employmentType: 'Full-time',
    postedDate: new Date().toISOString().slice(0,10),
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

  useEffect(() => {
    if (id) {
      const job = jobs.find(j => j._id === id);
      if (job) {
        setFormData(job);
      }
    }
  }, [id, jobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasRole('hr')) {
      setError('Only HR can create or edit jobs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
        salary: {
          ...formData.salary,
          min: Number(formData.salary.min),
          max: Number(formData.salary.max)
        }
      };

      if (id) {
        await updateJob(id, data);
      } else {
        await createJob(data);
      }
      navigate('/hr/job-postings');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!hasRole('hr')) return;
    setLoading(true);
    setError('');
    try {
      const data = {
        ...formData,
        status: 'draft',
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
        salary: {
          ...formData.salary,
          min: Number(formData.salary.min),
          max: Number(formData.salary.max)
        }
      };
      if (id) {
        await updateJob(id, data);
      } else {
        await createJob(data);
      }
      navigate('/hr/job-postings');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('hr')) {
    return (
      <Container>
        <ErrorMessage>You do not have permission to access this page.</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>{id ? 'Edit Job' : 'Create New Job'}</Title>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormGroup>
          <Label>Title</Label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Department</Label>
          <Select name="department" value={formData.department} onChange={handleChange} required>
            <option value="">Select Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Project">Project</option>
            <option value="HR">HR</option>
            <option value="Design">Design</option>
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Employment Type</Label>
          <Select name="employmentType" value={formData.employmentType} onChange={handleChange}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Posted Date</Label>
          <Input type="date" name="postedDate" value={formData.postedDate} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label>Closing Date</Label>
          <Input type="date" name="closingDate" value={formData.closingDate} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label>Location</Label>
          <Input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Requirements</Label>
          {formData.requirements.map((req, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Input
                type="text"
                value={req}
                onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                required
              />
              <Button
                type="button"
                onClick={() => removeArrayItem(index, 'requirements')}
                style={{ background: '#c5221f' }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addArrayItem('requirements')}
            style={{ background: '#137333' }}
          >
            Add Requirement
          </Button>
        </FormGroup>

        <FormGroup>
          <Label>Responsibilities</Label>
          {formData.responsibilities.map((resp, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Input
                type="text"
                value={resp}
                onChange={(e) => handleArrayChange(index, e.target.value, 'responsibilities')}
                required
              />
              <Button
                type="button"
                onClick={() => removeArrayItem(index, 'responsibilities')}
                style={{ background: '#c5221f' }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => addArrayItem('responsibilities')}
            style={{ background: '#137333' }}
          >
            Add Responsibility
          </Button>
        </FormGroup>

        <FormGroup>
          <Label>Salary Range</Label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Input
              type="number"
              name="salary.min"
              value={formData.salary.min}
              onChange={handleChange}
              placeholder="Min"
              required
            />
            <Input
              type="number"
              name="salary.max"
              value={formData.salary.max}
              onChange={handleChange}
              placeholder="Max"
              required
            />
            <Select
              name="salary.currency"
              value={formData.salary.currency}
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </Select>
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Status</Label>
          <Select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </Select>
        </FormGroup>

        <Actions>
          <SecondaryButton type="button" onClick={handleSaveAsDraft} disabled={loading}>
            {loading ? 'Saving...' : 'Save as Draft'}
          </SecondaryButton>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Publish Changes' : 'Publish'}
          </Button>
        </Actions>
      </Form>
    </Container>
  );
};

export default JobForm; 