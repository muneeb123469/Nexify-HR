import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaEye, FaPlusCircle } from 'react-icons/fa';
import { EmployerSideBar } from '../dashboard/EmployeeDashboard';
import LeaveRequest from './LeaveRequest';
import LeaveStatus from './LeaveStatus';

const Container = styled.div`
  margin-left: 250px;
  padding: 24px;
  max-width: 1200px;
  margin-right: auto;
  background: #f5f5f5;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
  }
`;

const Header = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const Title = styled.h1`
  color: #2C3E50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #4C9F9F;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`;

const Tab = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.active ? `
    background: #4C9F9F;
    color: white;
  ` : `
    background: #E0E0E0;
    color: #666;
    
    &:hover {
      background: #D0D0D0;
    }
  `}
`;

const ContentArea = styled.div`
  /* Content styling handled by individual components */
`;

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('request');
  const [refreshStatus, setRefreshStatus] = useState(0);

  const handleRequestSubmitted = () => {
    // Switch to status tab and refresh the status list
    setActiveTab('status');
    setRefreshStatus(prev => prev + 1);
  };

  return (
    <>
      <EmployerSideBar />
      <Container>
        <Header>
          <Title>
            <FaCalendarAlt />
            Leave Management
          </Title>
          <p style={{ color: '#666', margin: 0 }}>
            Submit new leave requests and track the status of your existing applications
          </p>
          
          <TabContainer>
            <Tab 
              active={activeTab === 'request'} 
              onClick={() => setActiveTab('request')}
            >
              <FaPlusCircle />
              New Request
            </Tab>
            <Tab 
              active={activeTab === 'status'} 
              onClick={() => setActiveTab('status')}
            >
              <FaEye />
              Request Status
            </Tab>
          </TabContainer>
        </Header>

        <ContentArea>
          {activeTab === 'request' && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
              <LeaveRequest showSidebar={false} onRequestSubmitted={handleRequestSubmitted} />
            </div>
          )}
          {activeTab === 'status' && <LeaveStatus key={refreshStatus} />}
        </ContentArea>
      </Container>
    </>
  );
};

export default LeaveManagement;