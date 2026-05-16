import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const EMPLOYEE_STORAGE_KEY = 'nexify_hr_employee_records';
const REMOTE_HOURS_STORAGE_KEY = 'nexify_hr_remote_work_hours';

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

const formatDuration = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return `${hours}h ${remainingMinutes.toString().padStart(2, '0')}m`;
};

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
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
    font-size: 14px;
    font-weight: 600;
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
  background: ${(props) => props.status === 'present' ? 'rgba(76, 159, 159, 0.1)' : '#F8F9FA'};
  color: ${(props) => props.status === 'present' ? '#4C9F9F' : '#666666'};

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
`;

const ActivityList = styled.div`
  display: grid;
  gap: 12px;
`;

const ActivityItem = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: #F8F9FA;
  color: #2C3E50;
`;

const EmptyState = styled.p`
  color: #666;
  margin: 0;
`;

const AttendanceOverview = () => {
  const { user } = useAuth() || {};
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employees] = useState(() => readStorageArray(EMPLOYEE_STORAGE_KEY));
  const [remoteSessions] = useState(() => readStorageArray(REMOTE_HOURS_STORAGE_KEY));

  const userEmail = user?.email?.toLowerCase();
  const currentEmployee = employees.find(
    (employee) => employee.email?.toLowerCase() === userEmail
  ) || employees[0];

  const employeeSessions = remoteSessions.filter(
    (session) => session.employeeId === currentEmployee?.id
  );
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const monthSessions = employeeSessions.filter((session) => session.date?.startsWith(monthKey));
  const presentDateSet = new Set(monthSessions.map((session) => session.date));
  const totalRemoteMinutes = monthSessions.reduce(
    (total, session) => total + (Number(session.durationMinutes) || 0),
    0
  );
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dateKey = dayDate.toISOString().slice(0, 10);
      days.push({
        date: dayDate,
        status: presentDateSet.has(dateKey) ? 'present' : 'empty',
      });
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Container>
      <Grid>
        <Card>
          <Title>
            <FaCalendarAlt />
            Attendance Overview
          </Title>

          <StatsGrid>
            <StatCard>
              <StatValue>{presentDateSet.size}</StatValue>
              <StatLabel>Remote Work Days</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{formatDuration(totalRemoteMinutes)}</StatValue>
              <StatLabel>Tracked Hours</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>0</StatValue>
              <StatLabel>Manual Attendance Rows</StatLabel>
            </StatCard>
          </StatsGrid>

          {!currentEmployee && (
            <EmptyState>No employee record found. Ask HR to sync your employee record first.</EmptyState>
          )}

          <Calendar>
            <CalendarHeader>
              <MonthSelector>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>Prev</button>
                <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>Next</button>
              </MonthSelector>
            </CalendarHeader>

            <WeekDays>
              {weekDays.map((day) => <span key={day}>{day}</span>)}
            </WeekDays>

            <Days>
              {days.map((day, index) => (
                day ? (
                  <Day
                    key={day.date.toISOString()}
                    status={day.status}
                    className={day.date.toDateString() === new Date().toDateString() ? 'today' : ''}
                  >
                    {day.date.getDate()}
                  </Day>
                ) : (
                  <Day key={`empty-${index}`} />
                )
              ))}
            </Days>

            <Legend>
              <LegendItem>
                <FaCheckCircle />
                Remote work session
              </LegendItem>
              <LegendItem>
                <FaExclamationCircle />
                Manual attendance not configured
              </LegendItem>
              <LegendItem>
                <FaTimesCircle />
                No local session
              </LegendItem>
            </Legend>
          </Calendar>
        </Card>

        <Card>
          <Title>
            <FaClock />
            Recent Activity
          </Title>

          {monthSessions.length === 0 ? (
            <EmptyState>No remote work sessions found for this month.</EmptyState>
          ) : (
            <ActivityList>
              {monthSessions.slice(0, 8).map((session) => (
                <ActivityItem key={session.id}>
                  <strong>{session.date}</strong>
                  <div>{session.startTime || '--'} - {session.endTime || 'Active'}</div>
                  <div>{formatDuration(session.durationMinutes)} tracked</div>
                </ActivityItem>
              ))}
            </ActivityList>
          )}
        </Card>
      </Grid>
    </Container>
  );
};

export default AttendanceOverview;
