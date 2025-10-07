import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaFileAlt, FaPaperPlane } from 'react-icons/fa';
import { EmployerSideBar } from '../dashboard/EmployeeDashboard';

const Container = styled.div`
  margin-left: 250px;
  padding: 24px;
  max-width: 800px;
  margin-right: auto;
  background: #f5f5f5;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
  }
`;

const Form = styled.form`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  color: #2C3E50;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #4C9F9F;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #2C3E50;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  color: #2C3E50;
  background: #FFFFFF;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 2px rgba(76, 159, 159, 0.1);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  color: #2C3E50;
  background: #FFFFFF;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 2px rgba(76, 159, 159, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  color: #2C3E50;
  background: #FFFFFF;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 2px rgba(76, 159, 159, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #4C9F9F;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #2A6F6F;
  }
`;

const LeaveRequest = () => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachments: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <>
      <EmployerSideBar />
      <Container>
      <Form onSubmit={handleSubmit}>
        <Title>
          <FaCalendarAlt />
          Request Leave
        </Title>

        <FormGroup>
          <Label>Leave Type</Label>
          <Select name="leaveType" value={formData.leaveType} onChange={handleChange} required>
            <option value="">Select Leave Type</option>
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="annual">Annual Leave</option>
            <option value="maternity">Maternity Leave</option>
            <option value="paternity">Paternity Leave</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Start Date</Label>
          <Input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>End Date</Label>
          <Input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Reason for Leave</Label>
          <TextArea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Please provide a detailed reason for your leave request..."
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Attachments (Optional)</Label>
          <Input
            type="file"
            name="attachments"
            onChange={handleChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </FormGroup>

        <SubmitButton type="submit">
          <FaPaperPlane />
          Submit Request
        </SubmitButton>
      </Form>
      </Container>
    </>
  );
};

export default LeaveRequest; 