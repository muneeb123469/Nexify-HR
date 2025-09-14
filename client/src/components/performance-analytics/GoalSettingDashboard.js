import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const GoalSettingDashboard = () => {
  const [selectedType, setSelectedType] = useState('individual');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [goals, setGoals] = useState([]);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  // Sample data - replace with actual data from your backend
  const employees = [
    { id: 1, name: 'John Doe', department: 'Engineering' },
    { id: 2, name: 'Jane Smith', department: 'Marketing' }
  ];

  const teams = [
    { id: 1, name: 'Engineering Team', department: 'Engineering' },
    { id: 2, name: 'Marketing Team', department: 'Marketing' }
  ];

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target: '',
    deadline: '',
    type: 'performance' // performance, project, development
  });

  useEffect(() => {
    // Calculate stats whenever goals change
    const newStats = {
      total: goals.length,
      pending: goals.filter(goal => goal.status === 'pending').length,
      inProgress: goals.filter(goal => goal.status === 'in-progress').length,
      completed: goals.filter(goal => goal.status === 'completed').length
    };
    setStats(newStats);
  }, [goals]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedEntity('');
  };

  const handleEntityChange = (entityId) => {
    setSelectedEntity(entityId);
  };

  const handleGoalFormChange = (e) => {
    const { name, value } = e.target;
    setGoalForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedEntity) {
      setNotification({
        type: 'error',
        message: 'Please select an employee or team'
      });
      return;
    }

    if (!goalForm.title || !goalForm.description || !goalForm.target || !goalForm.deadline) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    const newGoal = {
      id: Date.now(),
      entityId: selectedEntity,
      entityType: selectedType,
      ...goalForm,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setGoals(prev => [...prev, newGoal]);
    setGoalForm({
      title: '',
      description: '',
      target: '',
      deadline: '',
      type: 'performance'
    });

    setNotification({
      type: 'success',
      message: 'Goal set successfully!'
    });

    // Auto-dismiss notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderContent>
          <h1>Goal Setting Dashboard</h1>
          <StatsContainer>
            <StatCard>
              <StatIcon className="total">📊</StatIcon>
              <StatInfo>
                <StatValue>{stats.total}</StatValue>
                <StatLabel>Total Goals</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon className="pending">⏳</StatIcon>
              <StatInfo>
                <StatValue>{stats.pending}</StatValue>
                <StatLabel>Pending</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon className="in-progress">🔄</StatIcon>
              <StatInfo>
                <StatValue>{stats.inProgress}</StatValue>
                <StatLabel>In Progress</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard>
              <StatIcon className="completed">✅</StatIcon>
              <StatInfo>
                <StatValue>{stats.completed}</StatValue>
                <StatLabel>Completed</StatLabel>
              </StatInfo>
            </StatCard>
          </StatsContainer>
        </HeaderContent>
      </DashboardHeader>

      {notification && (
        <NotificationBar className={notification.type}>
          {notification.type === 'success' ? '✅ ' : '❌ '}
          {notification.message}
        </NotificationBar>
      )}

      <DashboardContent>
        <SelectionPanel>
          <PanelHeader>Select Target</PanelHeader>
          <TypeSelector>
            <TypeButton 
              className={selectedType === 'individual' ? 'active' : ''}
              onClick={() => handleTypeChange('individual')}
            >
              <TypeIcon>👤</TypeIcon>
              Individual
            </TypeButton>
            <TypeButton 
              className={selectedType === 'team' ? 'active' : ''}
              onClick={() => handleTypeChange('team')}
            >
              <TypeIcon>👥</TypeIcon>
              Team
            </TypeButton>
          </TypeSelector>

          <EntitySelector>
            <SectionTitle>Select {selectedType === 'individual' ? 'Employee' : 'Team'}</SectionTitle>
            <StyledSelect
              value={selectedEntity}
              onChange={(e) => handleEntityChange(e.target.value)}
            >
              <option value="">Select {selectedType === 'individual' ? 'an employee' : 'a team'}</option>
              {(selectedType === 'individual' ? employees : teams).map(entity => (
                <option key={entity.id} value={entity.id}>
                  {entity.name} - {entity.department}
                </option>
              ))}
            </StyledSelect>
          </EntitySelector>
        </SelectionPanel>

        <GoalFormPanel>
          <PanelHeader>Set New Goal</PanelHeader>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel>Goal Type</FormLabel>
              <StyledSelect
                name="type"
                value={goalForm.type}
                onChange={handleGoalFormChange}
              >
                <option value="performance">Performance Target</option>
                <option value="project">Project Deadline</option>
                <option value="development">Personal Development</option>
              </StyledSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Goal Title</FormLabel>
              <StyledInput
                type="text"
                name="title"
                value={goalForm.title}
                onChange={handleGoalFormChange}
                placeholder="Enter goal title"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Description</FormLabel>
              <StyledTextarea
                name="description"
                value={goalForm.description}
                onChange={handleGoalFormChange}
                placeholder="Enter goal description"
                rows="3"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Target</FormLabel>
              <StyledInput
                type="text"
                name="target"
                value={goalForm.target}
                onChange={handleGoalFormChange}
                placeholder="Enter target metric"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Deadline</FormLabel>
              <StyledInput
                type="date"
                name="deadline"
                value={goalForm.deadline}
                onChange={handleGoalFormChange}
              />
            </FormGroup>

            <SubmitButton type="submit">
              Set Goal
            </SubmitButton>
          </form>
        </GoalFormPanel>

        <GoalsListPanel>
          <PanelHeader>Recent Goals</PanelHeader>
          <GoalsList>
            {goals.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🎯</EmptyIcon>
                <EmptyText>No goals set yet. Create your first goal!</EmptyText>
              </EmptyState>
            ) : (
              goals.map(goal => (
                <GoalCard key={goal.id} className={goal.status}>
                  <GoalHeader>
                    <GoalTitle>{goal.title}</GoalTitle>
                    <GoalTypeTag className={goal.type}>
                      {goal.type === 'performance' && '📈 '}
                      {goal.type === 'project' && '📋 '}
                      {goal.type === 'development' && '🌱 '}
                      {goal.type}
                    </GoalTypeTag>
                  </GoalHeader>
                  <GoalDescription>{goal.description}</GoalDescription>
                  <GoalDetails>
                    <DetailItem>
                      <DetailLabel>Target:</DetailLabel>
                      <DetailValue>{goal.target}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Deadline:</DetailLabel>
                      <DetailValue>{formatDate(goal.deadline)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Created:</DetailLabel>
                      <DetailValue>{formatDate(goal.createdAt)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Status:</DetailLabel>
                      <StatusBadge className={goal.status}>{goal.status}</StatusBadge>
                    </DetailItem>
                  </GoalDetails>
                </GoalCard>
              ))
            )}
          </GoalsList>
        </GoalsListPanel>
      </DashboardContent>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #4C9F9F 0%, #2C3E50 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  h1 {
    font-size: 1.8rem;
    margin: 0 0 1rem 0;
    font-weight: 600;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  min-width: 150px;
  backdrop-filter: blur(5px);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    min-width: calc(50% - 0.5rem);
    padding: 0.5rem 0.75rem;
  }
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 0.75rem;
  
  &.total {
    color: #E3F2FD;
  }
  
  &.pending {
    color: #FFF3CD;
  }
  
  &.in-progress {
    color: #CCE5FF;
  }
  
  &.completed {
    color: #D4EDDA;
  }
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
`;

const NotificationBar = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &.success {
    background-color: #d4edda;
    color: #155724;
    border-left: 4px solid #28a745;
  }
  
  &.error {
    background-color: #f8d7da;
    color: #721c24;
    border-left: 4px solid #dc3545;
  }
  
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const DashboardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PanelHeader = styled.h2`
  font-size: 1.3rem;
  color: #2C3E50;
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #4C9F9F;
`;

const SelectionPanel = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const TypeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TypeButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    border-color: #4C9F9F;
    color: #4C9F9F;
  }
  
  &.active {
    background-color: #4C9F9F;
    color: white;
    border-color: #4C9F9F;
  }
`;

const TypeIcon = styled.span`
  font-size: 1.2rem;
`;

const EntitySelector = styled.div`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem;
  color: #2C3E50;
  font-size: 1.1rem;
  font-weight: 500;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #2C3E50;
  background-color: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 2px rgba(76, 159, 159, 0.2);
  }
  
  option {
    padding: 10px;
  }
`;

const GoalFormPanel = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2C3E50;
  font-weight: 500;
  font-size: 0.9rem;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #2C3E50;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 2px rgba(76, 159, 159, 0.2);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #2C3E50;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 2px rgba(76, 159, 159, 0.2);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #4C9F9F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  
  &:hover {
    background-color: #2A6F6F;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const GoalsListPanel = styled.div`
  grid-column: 1 / -1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
`;

const GoalsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ddd;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #4C9F9F;
`;

const EmptyText = styled.p`
  color: #666;
  text-align: center;
  font-size: 1rem;
`;

const GoalCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  &.pending {
    border-left-color: #ffc107;
  }
  
  &.in-progress {
    border-left-color: #007bff;
  }
  
  &.completed {
    border-left-color: #28a745;
  }
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const GoalTitle = styled.h3`
  margin: 0;
  color: #2C3E50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const GoalTypeTag = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  
  &.performance {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  &.project {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  &.development {
    background-color: #fff3e0;
    color: #f57c00;
  }
`;

const GoalDescription = styled.p`
  color: #666;
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const GoalDetails = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const DetailValue = styled.span`
  font-weight: 500;
  color: #2C3E50;
  font-size: 0.9rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  
  &.pending {
    background-color: #fff3cd;
    color: #856404;
  }
  
  &.in-progress {
    background-color: #cce5ff;
    color: #004085;
  }
  
  &.completed {
    background-color: #d4edda;
    color: #155724;
  }
`;

export default GoalSettingDashboard;