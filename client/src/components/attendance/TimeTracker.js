import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaClock, FaSignInAlt, FaSignOutAlt, FaSpinner, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { API_BASE_URL } from '../../config/api';


const Container = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Header = styled.div`
  background: linear-gradient(90deg, #A5D8D0 0%, #0A3D56 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  color: #FFFFFF;
  text-align: center;
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  svg {
    color: #FFFFFF;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1rem;
  opacity: 0.9;
`;

const TimeDisplay = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CurrentTime = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #4C9F9F;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
`;

const CurrentDate = styled.div`
  font-size: 1.125rem;
  color: #666666;
  margin-bottom: 24px;
`;

const StatusCard = styled.div`
  background: ${props => {
    switch (props.status) {
      case 'checked-in':
        return 'rgba(76, 159, 159, 0.1)';
      case 'checked-out':
        return 'rgba(29, 191, 115, 0.1)';
      default:
        return 'rgba(108, 117, 125, 0.1)';
    }
  }};
  border: 2px solid ${props => {
    switch (props.status) {
      case 'checked-in':
        return '#4C9F9F';
      case 'checked-out':
        return '#1DBF73';
      default:
        return '#6C757D';
    }
  }};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
`;

const StatusIcon = styled.div`
  font-size: 3rem;
  color: ${props => {
    switch (props.status) {
      case 'checked-in':
        return '#4C9F9F';
      case 'checked-out':
        return '#1DBF73';
      default:
        return '#6C757D';
    }
  }};
  margin-bottom: 16px;
`;

const StatusText = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => {
    switch (props.status) {
      case 'checked-in':
        return '#4C9F9F';
      case 'checked-out':
        return '#1DBF73';
      default:
        return '#6C757D';
    }
  }};
  margin-bottom: 8px;
`;

const StatusDetails = styled.div`
  color: #666666;
  font-size: 1rem;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ActionIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.disabled ? 'rgba(108, 117, 125, 0.1)' : 'rgba(76, 159, 159, 0.1)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  transition: all 0.3s ease;

  svg {
    font-size: 2rem;
    color: ${props => props.disabled ? '#6C757D' : '#4C9F9F'};
  }

  ${props => !props.disabled && `
    &:hover {
      background: rgba(76, 159, 159, 0.2);
      transform: scale(1.05);
    }
  `}
`;

const ActionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.disabled ? '#6C757D' : '#212121'};
  margin-bottom: 12px;
`;

const ActionDescription = styled.p`
  color: #666666;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: ${props => props.disabled ? '#6C757D' : '#4C9F9F'};
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${props => props.disabled ? '#6C757D' : '#2A6F6F'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

const WorkingHoursCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const WorkingHoursTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #212121;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #4C9F9F;
  }
`;

const WorkingHoursGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WorkingHoursStat = styled.div`
  text-align: center;
  padding: 16px;
  background: #F8F9FA;
  border-radius: 8px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4C9F9F;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: #666666;
  font-size: 0.875rem;
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #F44336;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #F44336;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    color: #F44336;
  }
`;

const SuccessMessage = styled.div`
  background: rgba(29, 191, 115, 0.1);
  border: 1px solid #1DBF73;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #1DBF73;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    color: #1DBF73;
  }
`;

const TimeTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance status
  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/attendance/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAttendanceStatus(data.data);
      } else if (response.status === 401) {
        // Token expired - show error message
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    });
  };

  const getLocationErrorMessage = (locationError) => {
    if (locationError?.code === 1) {
      return 'Location permission is blocked. Please allow location access for this site and try again.';
    }

    if (locationError?.code === 3) {
      return 'Location request timed out. Please try again.';
    }

    return 'Unable to get your location. Please enable location services and try again.';
  };

  const formatAttendanceError = (data, fallbackMessage) => {
    let errorMsg = data?.message || fallbackMessage;

    if (data?.nearestLocation) {
      errorMsg += `. Nearest location: ${data.nearestLocation.name} (${data.nearestLocation.distance}m away, ${data.nearestLocation.requiredRadius}m radius required)`;
    }

    return errorMsg;
  };

  const submitAttendanceAction = async ({ action, successMessage, fallbackMessage }) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setLocationError('');

    try {
      setLocationLoading(true);
      let location;
      try {
        location = await getCurrentLocation();
      } catch (locationError) {
        setLocationError(getLocationErrorMessage(locationError));
        return;
      } finally {
        setLocationLoading(false);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/attendance/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(successMessage);
        setAttendanceStatus(data.data);
        fetchTodayStatus();
        return;
      }

      if (response.status === 401) {
        setError('Your session has expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      const errorMsg = formatAttendanceError(data, fallbackMessage);
      if (response.status === 403 || data.nearestLocation) {
        setLocationError(errorMsg);
      } else {
        setError(errorMsg);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setLocationLoading(false);
    }
  };

  const handleCheckIn = async () => {
    await submitAttendanceAction({
      action: 'checkin',
      successMessage: 'Successfully checked in!',
      fallbackMessage: 'Failed to check in'
    });
  };

  const handleCheckOut = async () => {
    await submitAttendanceAction({
      action: 'checkout',
      successMessage: 'Successfully checked out!',
      fallbackMessage: 'Failed to check out'
    });
  };

  const formatCurrentTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDisplay = () => {
    if (!attendanceStatus || !attendanceStatus.hasCheckedIn) {
      return {
        status: 'not-checked-in',
        icon: <FaClock />,
        text: 'Ready to Check In',
        details: 'You haven\'t checked in today yet'
      };
    }

    if (attendanceStatus.isCurrentlyCheckedIn) {
      const sessionNumber = attendanceStatus.totalSessions;
      const sessions = sessionNumber > 1 ? ` (Session ${sessionNumber})` : '';
      return {
        status: 'checked-in',
        icon: <FaCheckCircle />,
        text: `Currently Checked In${sessions}`,
        details: `Check-in: ${formatTime(attendanceStatus.lastCheckInTime)}`
      };
    }

    if (attendanceStatus.completedSessions > 0) {
      return {
        status: 'checked-out',
        icon: <FaCheckCircle />,
        text: 'All Sessions Complete',
        details: `${attendanceStatus.completedSessions} sessions • Total: ${attendanceStatus.formattedWorkingHours || '0h 0m'}`
      };
    }

    return {
      status: 'checked-out',
      icon: <FaCheckCircle />,
      text: 'Ready for Next Session',
      details: 'You can check in to start a new work session'
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Container>
      <Header>
        <HeaderTitle>
          <FaClock />
          Time Tracker
        </HeaderTitle>
        <HeaderSubtitle>Mark your presence and track your working hours</HeaderSubtitle>
      </Header>

      {error && (
        <ErrorMessage>
          <FaTimesCircle />
          {error}
        </ErrorMessage>
      )}

      {locationError && (
        <ErrorMessage>
          <FaMapMarkerAlt />
          {locationError}
        </ErrorMessage>
      )}


      {success && (
        <SuccessMessage>
          <FaCheckCircle />
          {success}
        </SuccessMessage>
      )}

      <TimeDisplay>
        <CurrentTime>{formatCurrentTime(currentTime)}</CurrentTime>
        <CurrentDate>{formatDate(currentTime)}</CurrentDate>
      </TimeDisplay>

      <StatusCard status={statusDisplay.status}>
        <StatusIcon status={statusDisplay.status}>
          {statusDisplay.icon}
        </StatusIcon>
        <StatusText status={statusDisplay.status}>
          {statusDisplay.text}
        </StatusText>
        <StatusDetails>{statusDisplay.details}</StatusDetails>
      </StatusCard>

      <ActionsGrid>
        <ActionCard>
          <ActionIcon disabled={attendanceStatus?.isCurrentlyCheckedIn}>
            <FaSignInAlt />
          </ActionIcon>
          <ActionTitle disabled={attendanceStatus?.isCurrentlyCheckedIn}>
            Check In
          </ActionTitle>
          <ActionDescription>
            {attendanceStatus?.isCurrentlyCheckedIn
              ? 'Please check out first before checking in again'
              : (attendanceStatus?.completedSessions > 0
                ? 'Start a new work session'
                : 'Mark your arrival and start your workday')}
          </ActionDescription>
          <ActionButton
            disabled={attendanceStatus?.isCurrentlyCheckedIn || loading || locationLoading}
            onClick={handleCheckIn}
          >
            {locationLoading ? (
              <>
                <FaLocationArrow />
                Getting Location...
              </>
            ) : loading ? (
              <>
                <FaSpinner className="fa-spin" />
                Checking In...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Check In
              </>
            )}
          </ActionButton>
        </ActionCard>

        <ActionCard>
          <ActionIcon disabled={!attendanceStatus?.isCurrentlyCheckedIn}>
            <FaSignOutAlt />
          </ActionIcon>
          <ActionTitle disabled={!attendanceStatus?.isCurrentlyCheckedIn}>
            Check Out
          </ActionTitle>
          <ActionDescription>
            {attendanceStatus?.isCurrentlyCheckedIn
              ? 'End your current work session'
              : 'You need to check in first'}
          </ActionDescription>
          <ActionButton
            disabled={!attendanceStatus?.isCurrentlyCheckedIn || loading || locationLoading}
            onClick={handleCheckOut}
          >
            {locationLoading ? (
              <>
                <FaLocationArrow />
                Getting Location...
              </>
            ) : loading ? (
              <>
                <FaSpinner className="fa-spin" />
                Checking Out...
              </>
            ) : (
              <>
                <FaSignOutAlt />
                Check Out
              </>
            )}
          </ActionButton>
        </ActionCard>
      </ActionsGrid>

      {attendanceStatus?.hasCheckedIn && (
        <WorkingHoursCard>
          <WorkingHoursTitle>
            <FaClock />
            Today's Summary
          </WorkingHoursTitle>
          <WorkingHoursGrid>
            <WorkingHoursStat>
              <StatValue>
                {formatTime(attendanceStatus.lastCheckInTime) || '--:--'}
              </StatValue>
              <StatLabel>Last Check In</StatLabel>
            </WorkingHoursStat>
            <WorkingHoursStat>
              <StatValue>
                {formatTime(attendanceStatus.lastCheckOutTime) || '--:--'}
              </StatValue>
              <StatLabel>Last Check Out</StatLabel>
            </WorkingHoursStat>
            <WorkingHoursStat>
              <StatValue>
                {attendanceStatus.formattedWorkingHours || '0h 0m'}
              </StatValue>
              <StatLabel>Total Working Hours</StatLabel>
            </WorkingHoursStat>
          </WorkingHoursGrid>
          <WorkingHoursGrid style={{ marginTop: '16px' }}>
            <WorkingHoursStat>
              <StatValue>
                {attendanceStatus.totalSessions || 0}
              </StatValue>
              <StatLabel>Total Sessions</StatLabel>
            </WorkingHoursStat>
            <WorkingHoursStat>
              <StatValue>
                {attendanceStatus.completedSessions || 0}
              </StatValue>
              <StatLabel>Completed Sessions</StatLabel>
            </WorkingHoursStat>
            <WorkingHoursStat>
              <StatValue>
                {attendanceStatus.isCurrentlyCheckedIn ? 'Active' : 'None'}
              </StatValue>
              <StatLabel>Current Status</StatLabel>
            </WorkingHoursStat>
          </WorkingHoursGrid>
        </WorkingHoursCard>
      )}
    </Container>
  );
};

export default TimeTracker;
