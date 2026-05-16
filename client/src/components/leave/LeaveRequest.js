import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const EMPLOYEE_STORAGE_KEY = 'nexify_hr_employee_records';
const LEAVE_STORAGE_KEY = 'nexify_hr_leave_requests';

const readStorageArray = (key) => {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return [];
  }
};

const Container = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
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

const Card = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const RequestList = styled.div`
  display: grid;
  gap: 12px;
`;

const RequestItem = styled.div`
  padding: 14px;
  background: #F8F9FA;
  border-radius: 8px;
  color: #2C3E50;
`;

const RequestMeta = styled.div`
  color: #666;
  font-size: 13px;
  margin-top: 6px;
`;

const Notification = styled.div`
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #D4EDDA;
  color: #155724;
`;

const EmptyState = styled.p`
  color: #666;
  margin: 0;
`;

const LeaveRequest = () => {
  const { user } = useAuth() || {};
  const [employeeRecords] = useState(() => readStorageArray(EMPLOYEE_STORAGE_KEY));
  const [leaveRequests, setLeaveRequests] = useState(() => readStorageArray(LEAVE_STORAGE_KEY));
  const [notification, setNotification] = useState('');
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachments: null
  });

  const userEmail = user?.email?.toLowerCase();
  const currentEmployee = employeeRecords.find(
    (employee) => employee.email?.toLowerCase() === userEmail
  ) || employeeRecords[0];

  const employeeLeaveRequests = leaveRequests.filter(
    (request) =>
      request.employeeId === currentEmployee?.id ||
      (request.employeeEmail && request.employeeEmail === currentEmployee?.email)
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentEmployee) {
      setNotification('No employee record found. Ask HR to sync your employee record first.');
      return;
    }

    const nextRequest = {
      id: `leave_${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeEmail: currentEmployee.email || '',
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      attachmentName: formData.attachments?.name || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const nextRequests = [...leaveRequests, nextRequest];

    setLeaveRequests(nextRequests);
    localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(nextRequests));
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      attachments: null,
    });
    setNotification('Leave request saved locally for HR review.');
  };

  return (
    <Container>
      {notification && <Notification>{notification}</Notification>}
      {!currentEmployee && (
        <Card>
          <EmptyState>No employee record found. Ask HR to sync your employee record first.</EmptyState>
        </Card>
      )}
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

      <Card>
        <Title>
          <FaCalendarAlt />
          My Submitted Leave Requests
        </Title>
        {employeeLeaveRequests.length === 0 ? (
          <EmptyState>No leave requests submitted yet.</EmptyState>
        ) : (
          <RequestList>
            {employeeLeaveRequests.map((request) => (
              <RequestItem key={request.id}>
                <strong>{request.leaveType}</strong> from {request.startDate} to {request.endDate}
                <RequestMeta>
                  Status: {request.status} | Submitted: {new Date(request.submittedAt).toLocaleString()}
                </RequestMeta>
              </RequestItem>
            ))}
          </RequestList>
        )}
      </Card>
    </Container>
  );
};

export default LeaveRequest;
