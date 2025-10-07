import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { EmployerSideBar } from '../dashboard/EmployeeDashboard';
import TimeTracker from './TimeTracker';

const Container = styled.div`
  margin-left: 250px;
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
  }
`;

const TabContainer = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px 24px;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.active ? '#4C9F9F' : '#666666'};
  border-bottom: 3px solid ${props => props.active ? '#4C9F9F' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    color: #4C9F9F;
    background: rgba(76, 159, 159, 0.05);
  }

  svg {
    font-size: 1.125rem;
  }
`;

const TabContent = styled.div`
  padding: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #F8F9FA;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #4C9F9F;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: #666666;
  font-size: 14px;
`;

const Calendar = styled.div`
  margin-top: 24px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  button {
    background: none;
    border: none;
    color: #4C9F9F;
    cursor: pointer;
    font-size: 16px;
    
    &:hover {
      color: #2A6F6F;
    }
  }
  
  span {
    font-weight: 600;
    color: #2C3E50;
  }
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
  
  span {
    text-align: center;
    font-weight: 500;
    color: #666666;
    font-size: 14px;
  }
`;

const Days = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const Day = styled.div`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  ${props => {
    switch (props.status) {
      case 'present':
        return 'background: rgba(76, 159, 159, 0.1); color: #4C9F9F;';
      case 'absent':
        return 'background: rgba(244, 67, 54, 0.1); color: #F44336;';
      case 'late':
        return 'background: rgba(255, 193, 7, 0.1); color: #FFC107;';
      default:
        return 'background: #F8F9FA; color: #666666;';
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.today {
    border: 2px solid #4C9F9F;
  }
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666666;
  font-size: 14px;
  
  svg {
    color: ${props => {
      switch (props.type) {
        case 'present':
          return '#4C9F9F';
        case 'absent':
          return '#F44336';
        case 'late':
          return '#FFC107';
        default:
          return '#666666';
      }
    }};
  }
`;

const AttendanceOverview = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        status: Math.random() > 0.3 ? 'present' : Math.random() > 0.5 ? 'late' : 'absent'
      });
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'time':
        return <TimeTracker />;
      case 'overview':
      default:
        return (
          <div style={{ padding: '24px' }}>
            <Grid>
              <Card>
                <Title>
                  <FaCalendarAlt />
                  Attendance Overview
                </Title>
                
                <StatsGrid>
                  <StatCard>
                    <StatValue>22</StatValue>
                    <StatLabel>Present Days</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>3</StatValue>
                    <StatLabel>Late Days</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>1</StatValue>
                    <StatLabel>Absent Days</StatLabel>
                  </StatCard>
                </StatsGrid>
                
                <Calendar>
                  <CalendarHeader>
                    <MonthSelector>
                      <button onClick={handlePrevMonth}>←</button>
                      <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <button onClick={handleNextMonth}>→</button>
                    </MonthSelector>
                  </CalendarHeader>
                  
                  <WeekDays>
                    {weekDays.map(day => (
                      <span key={day}>{day}</span>
                    ))}
                  </WeekDays>
                  
                  <Days>
                    {days.map((day, index) => (
                      day ? (
                        <Day
                          key={index}
                          status={day.status}
                          className={day.date.toDateString() === new Date().toDateString() ? 'today' : ''}
                        >
                          {day.date.getDate()}
                        </Day>
                      ) : (
                        <Day key={index} />
                      )
                    ))}
                  </Days>
                  
                  <Legend>
                    <LegendItem type="present">
                      <FaCheckCircle />
                      Present
                    </LegendItem>
                    <LegendItem type="late">
                      <FaExclamationCircle />
                      Late
                    </LegendItem>
                    <LegendItem type="absent">
                      <FaTimesCircle />
                      Absent
                    </LegendItem>
                  </Legend>
                </Calendar>
              </Card>
              
              <Card>
                <Title>
                  <FaClock />
                  Recent Activity
                </Title>
                
                {/* Add recent activity list here */}
              </Card>
            </Grid>
          </div>
        );
    }
  };

  return (
    <>
      <EmployerSideBar />
      <Container>
        <TabContainer>
          <TabHeader>
            <Tab 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
            >
              <FaCalendarAlt />
              Overview
            </Tab>
            <Tab 
              active={activeTab === 'time'} 
              onClick={() => setActiveTab('time')}
            >
              <FaClock />
              Time
            </Tab>
          </TabHeader>
          <TabContent>
            {renderTabContent()}
          </TabContent>
        </TabContainer>
      </Container>
    </>
  );
};

export default AttendanceOverview; 