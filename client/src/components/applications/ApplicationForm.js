import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import axios from 'axios';
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
  margin-bottom: 1rem;
`;

const JobInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  border-left: 4px solid #1a73e8;
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
  &:focus { outline: none; border-color: #1a73e8; }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  &:focus { outline: none; border-color: #1a73e8; }
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
  margin-right: 1rem;
  &:hover { background: #1557b0; }
  &:disabled { background: #ccc; cursor: not-allowed; }
`;

const SecondaryButton = styled(Button)`
  background: #f1f3f4;
  color: #333;
  &:hover { background: #e8eaed; }
`;

const ErrorMessage = styled.div`
  color: #c5221f;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  color: #137333;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const ApplicationForm = () => {
  const { id } = useParams();              // jobId from route
  const navigate = useNavigate();
  const { user, hasRole, isAuthenticated } = useAuth();
  const { jobs } = useJobs();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Only the fields your server accepts
  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    coverLetter: '',
    resume: null
  });

  useEffect(() => {
    const foundJob = jobs.find(j => j._id === id);
    if (foundJob) setJob(foundJob);
  }, [id, jobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData(prev => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      setError('Please login to submit an application');
      return;
    }
    if (!hasRole('applicant')) {
      setError('Only applicants can submit job applications');
      return;
    }
    if (!formData.resume) {
      setError('Resume file is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const fd = new FormData();
      fd.append('jobId', id);                 // matches server route
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('phone', formData.phone);
      fd.append('coverLetter', formData.coverLetter);
      fd.append('resume', formData.resume);   // field name expected by upload middleware

      const res = await axios.post('http://localhost:5000/api/applications', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Application response:', res.data);
      setSuccess('Application submitted successfully!');
      setTimeout(() => navigate('/applicant-dashboard/applications'), 1500);
    } catch (err) {
      console.error('Application submission error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError(`Validation failed: ${err.response.data.errors.join(', ')}`);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(`Request failed with status ${err.response?.status || 'unknown'}: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return <Container><ErrorMessage>Please login to access this page.</ErrorMessage></Container>;
  }
  if (!hasRole('applicant')) {
    return <Container><ErrorMessage>You do not have permission to access this page.</ErrorMessage></Container>;
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Apply for Job</Title>

        {job && (
          <JobInfo>
            <h3>{job.title}</h3>
            <p><strong>Department:</strong> {job.department}</p>
            <p><strong>Location:</strong> {job.location}</p>
          </JobInfo>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <FormGroup>
          <Label>Full Name *</Label>
          <Input name="name" type="text" value={formData.name} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label>Email *</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label>Phone Number *</Label>
          <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label>Cover Letter *</Label>
          <TextArea name="coverLetter" value={formData.coverLetter} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label>Resume (PDF or DOC) *</Label>
          <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
        </FormGroup>

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
          <SecondaryButton type="button" onClick={() => navigate(-1)}>Cancel</SecondaryButton>
        </div>
      </Form>
    </Container>
  );
};

export default ApplicationForm;
