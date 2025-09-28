import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaThLarge, FaUsers, FaClock, FaLeaf, FaMoneyBill, FaCog, FaChartBar, FaSignOutAlt, FaSearch, FaMicrophone, FaBell, FaChevronRight, FaDownload, FaMoneyBillWave, FaPercent, FaTrophy, FaBullseye, FaHistory, FaPlus, FaCheckCircle, FaSpinner, FaCalendarAlt, FaFileUpload, FaFileAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaComments, FaPaperPlane, FaHeadset, FaBolt, FaHeartbeat, FaUserEdit } from 'react-icons/fa';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 250px;
  background: #0A3D56;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 100vh;
  z-index: 100;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4C9F9F #0A3D56;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #0A3D56;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4C9F9F;
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    
    &.open {
      transform: translateX(0);
    }
  }
`;

const Logo = styled.div`
  padding: 32px 24px 24px 24px;
  position: sticky;
  top: 0;
  background: #0A3D56;
  z-index: 2;
  h1 {
    font-size: 1.6em;
    font-weight: 800;
    letter-spacing: 2px;
    color: #FFFFFF;
    span {
      color: #4C9F9F;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #FFFFFF;
  background: ${props => props.active ? '#4C9F9F' : 'transparent'};
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#4C9F9F' : '#2A6F6F'};
  }

  svg {
    color: #FFFFFF;
  }
`;

const LogoutButton = styled.button`
  margin: 24px;
  padding: 12px;
  background: #4C9F9F;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: sticky;
  bottom: 0;
  z-index: 2;

  &:hover {
    background: #2A6F6F;
  }

  svg {
    color: #FFFFFF;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: linear-gradient(90deg, #A5D8D0 0%, #0A3D56 100%);
  padding: 16px 24px;
  border-radius: 12px;
  color: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 280px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  input {
    width: 100%;
    padding: 10px 40px 10px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 0.875rem;
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    &:focus {
      outline: none;
      border-color: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }
  }

  svg {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #FFFFFF;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationButton = styled(motion.button)`
  background: none;
  border: none;
  color: #FFFFFF;
  font-size: 1.25rem;
  cursor: pointer;
  position: relative;
  padding: 8px;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #1DBF73;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid #2A6F6F;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const UserDetails = styled.div`
  text-align: right;
`;

const UserName = styled.p`
  font-weight: 600;
  color: #FFFFFF;
  font-size: 0.875rem;
`;

const UserRole = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFFFFF;
`;

const TodayBanner = styled(motion.section)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #A5D8D0 0%, #0A3D56 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #FFFFFF;
`;

const BannerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BannerImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: brightness(0) invert(1);
`;

const BannerText = styled.div`
  p {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 4px;
    opacity: 0.9;
    color: rgba(255, 255, 255, 0.9);
  }
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #FFFFFF;
  }
`;

const StatusBox = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 8px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const StatusLabel = styled.span`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #FFFFFF;
`;

const StatusValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #FFFFFF;
`;

const StatusSubtext = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
`;

const ApprovalTable = styled(motion.section)`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableTitle = styled.h4`
  font-weight: 600;
  color: #212121;
  margin-bottom: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px;
  color: #666666;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  color: #212121;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'approved':
        return 'rgba(29, 191, 115, 0.1)';
      case 'pending':
        return 'rgba(255, 193, 7, 0.1)';
      case 'rejected':
        return 'rgba(244, 67, 54, 0.1)';
      default:
        return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'approved':
        return '#1DBF73';
      case 'pending':
        return '#FFC107';
      case 'rejected':
        return '#F44336';
      default:
        return '#212121';
    }
  }};
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  font-size: 0.75rem;
  color: #7f8c8d;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendColor = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.color};
`;

const AttendanceChart = styled(motion.section)`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartLegend = styled.div`
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #7f8c8d;
`;

const ChartTitle = styled.h4`
  font-weight: 600;
  color: #2C3E50;
`;

const MonthSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1DBF73;
  font-weight: 500;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(29, 191, 115, 0.1);
  }
`;

const ChartGrid = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const TimeColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
`;

const TimeLabel = styled.span`
  font-size: 0.625rem;
  color: #95a5a6;
  margin-bottom: 4px;
`;

const BarContainer = styled.div`
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  position: relative;
  height: 100px;
`;

const BarBackground = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 12px;
  background: #f0f0f0;
  border-radius: 4px;
`;

const BarContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 12px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
`;

const Bar = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'present-on-time':
        return '#3498db';
      case 'present-late':
        return '#f1c40f';
      case 'holiday':
        return '#9b59b6';
      case 'absent':
        return '#95a5a6';
      default:
        return '#3498db';
    }
  }};
  border-radius: 2px;
  height: ${props => props.height};
`;

const PayrollOverview = styled(motion.section)`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const PayrollHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PayrollTitle = styled.h4`
  font-weight: 600;
  color: #212121;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #4C9F9F;
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4C9F9F;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2A6F6F;
  }

  svg {
    font-size: 1rem;
  }
`;

const PayrollGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
`;

const PayrollCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #666666;
  font-size: 0.875rem;

  svg {
    color: #4C9F9F;
  }
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #212121;
  margin-bottom: 4px;
`;

const CardSubtext = styled.div`
  font-size: 0.75rem;
  color: #666666;
`;

const TaxDeductions = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
`;

const TaxHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #212121;
  font-weight: 600;

  svg {
    color: #4C9F9F;
  }
`;

const TaxList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const TaxItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const TaxLabel = styled.span`
  color: #666666;
  font-size: 0.875rem;
`;

const TaxValue = styled.span`
  color: #212121;
  font-weight: 500;
`;

const PerformanceSection = styled(motion.section)`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  font-weight: 600;
  color: #212121;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #4C9F9F;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4C9F9F;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2A6F6F;
  }

  svg {
    font-size: 1rem;
  }
`;

const PerformanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
`;

const KpiCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const KpiTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #666666;
  font-size: 0.875rem;

  svg {
    color: #4C9F9F;
  }
`;

const KpiValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #212121;
  margin-bottom: 4px;
`;

const KpiSubtext = styled.div`
  font-size: 0.75rem;
  color: #666666;
`;

const GoalsSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const GoalsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const GoalsList = styled.div`
  display: grid;
  gap: 16px;
`;

const GoalItem = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GoalInfo = styled.div`
  flex: 1;
`;

const GoalTitle = styled.div`
  font-weight: 600;
  color: #212121;
  margin-bottom: 4px;
`;

const GoalProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666666;
  font-size: 0.875rem;
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #4C9F9F;
  width: ${props => props.progress}%;
`;

const GoalStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => {
    switch (props.status) {
      case 'completed':
        return '#4C9F9F';
      case 'in-progress':
        return '#FFC107';
      default:
        return '#666666';
    }
  }};
  font-size: 0.875rem;
`;

const AppraisalHistory = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
`;

const AppraisalList = styled.div`
  display: grid;
  gap: 16px;
`;

const AppraisalItem = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px;
`;

const AppraisalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const AppraisalDate = styled.div`
  font-weight: 600;
  color: #212121;
`;

const AppraisalScore = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4C9F9F;
  font-weight: 500;
`;

const AppraisalFeedback = styled.p`
  color: #666666;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const SelfServiceSection = styled(motion.section)`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
`;

const ServiceCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background: #4C9F9F;
    color: #FFFFFF;

    svg {
      color: #FFFFFF;
    }

    .service-title, .service-description {
      color: #FFFFFF;
    }
  }
`;

const ServiceIcon = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(76, 159, 159, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  svg {
    font-size: 24px;
    color: #4C9F9F;
  }
`;

const ServiceTitle = styled.h5`
  font-weight: 600;
  color: #212121;
  margin-bottom: 8px;
  font-size: 1rem;
`;

const ServiceDescription = styled.p`
  color: #666666;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const DocumentSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const DocumentList = styled.div`
  display: grid;
  gap: 16px;
`;

const DocumentItem = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DocumentIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(76, 159, 159, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: #4C9F9F;
  }
`;

const DocumentDetails = styled.div`
  flex: 1;
`;

const DocumentName = styled.div`
  font-weight: 600;
  color: #212121;
  margin-bottom: 4px;
`;

const DocumentStatus = styled.div`
  font-size: 0.75rem;
  color: #666666;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4C9F9F;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2A6F6F;
  }
`;

const ProfileSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const ProfileItem = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(76, 159, 159, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: #4C9F9F;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileLabel = styled.div`
  font-size: 0.75rem;
  color: #666666;
  margin-bottom: 4px;
`;

const ProfileValue = styled.div`
  font-weight: 500;
  color: #212121;
`;

const FeedbackSection = styled(motion.section)`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const FeedbackGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;;
  gap: 24px;
`;

const FeedbackForm = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
`;

const FormTitle = styled.h5`
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

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 8px;
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #212121;
  background: #FFFFFF;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 2px rgba(76, 159, 159, 0.1);;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #212121;
  background: #FFFFFF;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 2px rgba(76, 159, 159, 0.1);;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #4C9F9F;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
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

const SupportCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SupportHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SupportIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(76, 159, 159, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 24px;
    color: #4C9F9F;
  }
`;

const SupportTitle = styled.h5`
  font-weight: 600;
  color: #212121;
  margin-bottom: 4px;
`;

const SupportDescription = styled.p`
  color: #666666;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const SupportOptions = styled.div`
  display: grid;
  gap: 16px;
  margin-top: auto;
`;

const SupportOption = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #FFFFFF;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #212121;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4C9F9F;
    background: rgba(76, 159, 159, 0.05);
  }

  svg {
    color: #4C9F9F;
  }
`;

const QuickActionsSection = styled(motion.section)`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

const QuickActionCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    background: #4C9F9F;

    .action-icon {
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
    }

    .action-title, .action-description {
      color: #FFFFFF;
    }

    .action-button {
      background: #FFFFFF;
      color: #4C9F9F;
    }
  }
`;

const ActionIcon = styled.div`
  width: 56px;
  height: 56px;
  background: rgba(76, 159, 159, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: all 0.3s ease;

  svg {
    font-size: 24px;
    color: #4C9F9F;
    transition: all 0.3s ease;
  }
`;

const ActionTitle = styled.h5`
  font-weight: 600;
  color: #212121;
  margin-bottom: 8px;
  font-size: 1.125rem;
  transition: all 0.3s ease;
`;

const ActionDescription = styled.p`
  color: #666666;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 24px;
  transition: all 0.3s ease;
`;

const ActionButton = styled.button`
  margin-top: auto;
  padding: 10px 16px;
  background: #4C9F9F;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #2A6F6F;
  }
`;

const ActionBadge = styled.span`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #1DBF73;
  color: #FFFFFF;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1000;
  background: #4C9F9F;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2A6F6F;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;
export const EmployerSideBar=()=>{
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return(
    <>
        <MobileMenuButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <FaThLarge />
      </MobileMenuButton>
      
      <Sidebar className={isSidebarOpen ? 'open' : ''}>
        <div>
          <Logo>
            <h1>Nexify<span>-HR</span></h1>
          </Logo>
          <Nav>
            <NavItem active>
              <FaThLarge />
              Dashboard Overview
            </NavItem>
            <NavItem onClick={() => window.location.href = '/employee/attendance'}>
              <FaClock />
              Attendance & Time
            </NavItem>
            <NavItem onClick={() => window.location.href = '/employee/leave-request'}>
              <FaLeaf />
              Leave Management
            </NavItem>
           
            <NavItem onClick={() => window.location.href = '/self-service/personal-info'}>
              <FaUserEdit />
              Personal Information
            </NavItem>
            <NavItem onClick={() => window.location.href = '/remote-work/wellness-fitness'}>
              <FaHeartbeat />
              Wellness & Fitness
            </NavItem>
            <NavItem onClick={() => window.location.href = '/remote-work/hours-tracker'}>
              <FaClock />
              Remote Work Hours
            </NavItem>
          </Nav>
        </div>
        <LogoutButton>
          <FaSignOutAlt />
          Logout
        </LogoutButton>
      </Sidebar>
      </>)
}
const EmployeeDashboard = () => {

  return (
    <DashboardContainer>
     <EmployerSideBar/>

      <MainContent>
        <Header>
          <h2 className="text-[#2c3e50] text-sm font-medium">Employee panel</h2>
          <div className="flex items-center space-x-4">
            <SearchBar>
              <input type="text" placeholder="Search..." />
              <FaSearch />
              <FaMicrophone />
            </SearchBar>
            <NotificationButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBell />
              <NotificationBadge>3</NotificationBadge>
            </NotificationButton>
            <UserInfo>
              <UserDetails>
                <UserName>Bonte</UserName>
                <UserRole>Ux Designer</UserRole>
              </UserDetails>
              <UserAvatar
                src="https://storage.googleapis.com/a1aa/image/207c93ec-6e47-4c91-ac7d-c1cf4b255944.jpg"
                alt="User avatar"
              />
            </UserInfo>
          </div>
        </Header>

        <TodayBanner
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BannerInfo>
            <BannerImage
              src="https://storage.googleapis.com/a1aa/image/5caee6ea-94a3-47e7-6830-42733fc6905f.jpg"
              alt="Cartoon man sitting on a chair with laptop"
            />
            <BannerText>
              <p>21 September 2022</p>
              <h3>Today</h3>
            </BannerText>
          </BannerInfo>
          <StatusBox>
            <StatusLabel>Present-On-time</StatusLabel>
            <StatusValue>10:11 AM</StatusValue>
            <StatusSubtext>Entry Time</StatusSubtext>
          </StatusBox>
        </TodayBanner>

        <ApprovalTable
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <TableTitle>Approval</TableTitle>
          <Table>
            <thead>
              <tr>
                <TableHeader>DATE OF APPLICATION</TableHeader>
                <TableHeader>APPLICATION TYPE</TableHeader>
                <TableHeader>DURATION</TableHeader>
                <TableHeader>STATUS</TableHeader>
              </tr>
            </thead>
            <tbody>
              <TableRow>
                <TableCell>03/07/2021</TableCell>
                <TableCell>Casual leave</TableCell>
                <TableCell>02 (05-06 Jul)</TableCell>
                <TableCell>
                  <StatusBadge status="pending">Pending</StatusBadge>
                </TableCell>
              </TableRow>
            </tbody>
          </Table>
          <Legend>
            <LegendItem>
              <LegendColor color="#27ae60" />
              <span>Approved</span>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#e74c3c" />
              <span>Rejected</span>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#f1c40f" />
              <span>Pending</span>
            </LegendItem>
          </Legend>
        </ApprovalTable>

        <AttendanceChart
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ChartHeader>
            <ChartLegend>
              <LegendItem>
                <LegendColor color="#3498db" />
                <span>Present-on time</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#f1c40f" />
                <span>Present-late entry</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#9b59b6" />
                <span>Govt Holiday</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#95a5a6" />
                <span>Absent</span>
              </LegendItem>
            </ChartLegend>
            <MonthSelector>
              <span>Sep 2022</span>
              <FaChevronRight />
            </MonthSelector>
          </ChartHeader>
          <ChartGrid>
            {[{
              time: '11:00',
              heights: ['h-full', 'h-2/3', 'h-full', 'h-1/2', 'h-3/4']
            }, {
              time: '10:15',
              heights: ['h-1/2', 'h-1/3', 'h-full', 'h-3/4', 'h-1/2']
            }, {
              time: '09:45',
              heights: ['h-1/3', 'h-1/2', 'h-1/3', 'h-1/2', 'h-1/3']
            }, {
              time: '10:00',
              heights: ['h-1/2', 'h-1/3', 'h-1/2', 'h-1/3', 'h-1/2']
            }, {
              time: '09:30',
              heights: ['h-1/3', 'h-1/2', 'h-1/3', 'h-1/2', 'h-1/3']
            }, {
              time: '09:00',
              heights: ['h-1/2', 'h-1/3', 'h-1/2', 'h-1/3', 'h-1/2']
            }, {
              time: '09:15',
              heights: ['h-1/3', 'h-1/2', 'h-1/3', 'h-1/2', 'h-1/3']
            }].map((item, index) => (
              <TimeColumn key={index}>
                <TimeLabel>{item.time}</TimeLabel>
                <BarContainer>
                  <BarBackground />
                  <BarContent>
                    {item.heights.map((height, heightIndex) => (
                      <Bar
                        key={heightIndex}
                        height={height}
                        type={heightIndex < 2 ? 'present-on-time' : 'present-late'}
                      />
                    ))}
                  </BarContent>
                </BarContainer>
              </TimeColumn>
            ))}
          </ChartGrid>
        </AttendanceChart>

        <PayrollOverview
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <PayrollHeader>
            <PayrollTitle>
              <FaMoneyBillWave />
              Payroll Overview
            </PayrollTitle>
            <DownloadButton>
              <FaDownload />
              Download Payslip
            </DownloadButton>
          </PayrollHeader>

          <PayrollGrid>
            <PayrollCard>
              <CardTitle>
                <FaMoneyBillWave />
                Basic Salary
              </CardTitle>
              <CardValue>$4,500.00</CardValue>
              <CardSubtext>Monthly</CardSubtext>
            </PayrollCard>

            <PayrollCard>
              <CardTitle>
                <FaMoneyBillWave />
                Bonuses
              </CardTitle>
              <CardValue>$500.00</CardValue>
              <CardSubtext>Performance Bonus</CardSubtext>
            </PayrollCard>

            <PayrollCard>
              <CardTitle>
                <FaMoneyBillWave />
                Deductions
              </CardTitle>
              <CardValue>$750.00</CardValue>
              <CardSubtext>Tax & Benefits</CardSubtext>
            </PayrollCard>
          </PayrollGrid>

          <TaxDeductions>
            <TaxHeader>
              <FaPercent />
              Tax Deductions
            </TaxHeader>
            <TaxList>
              <TaxItem>
                <TaxLabel>Income Tax</TaxLabel>
                <TaxValue>$450.00</TaxValue>
              </TaxItem>
              <TaxItem>
                <TaxLabel>Social Security</TaxLabel>
                <TaxValue>$200.00</TaxValue>
              </TaxItem>
              <TaxItem>
                <TaxLabel>Health Insurance</TaxLabel>
                <TaxValue>$75.00</TaxValue>
              </TaxItem>
              <TaxItem>
                <TaxLabel>Other Deductions</TaxLabel>
                <TaxValue>$25.00</TaxValue>
              </TaxItem>
            </TaxList>
          </TaxDeductions>
        </PayrollOverview>

        <PerformanceSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <SectionHeader>
            <SectionTitle>
              <FaTrophy />
              Performance & Goals
            </SectionTitle>
            <AddButton>
              <FaPlus />
              Set New Goal
            </AddButton>
          </SectionHeader>

          <PerformanceGrid>
            <KpiCard>
              <KpiTitle>
                <FaTrophy />
                Overall Performance
              </KpiTitle>
              <KpiValue>85%</KpiValue>
              <KpiSubtext>Above Average</KpiSubtext>
            </KpiCard>

            <KpiCard>
              <KpiTitle>
                <FaChartBar />
                Project Completion
              </KpiTitle>
              <KpiValue>92%</KpiValue>
              <KpiSubtext>Last Quarter</KpiSubtext>
            </KpiCard>

            <KpiCard>
              <KpiTitle>
                <FaUsers />
                Team Collaboration
              </KpiTitle>
              <KpiValue>88%</KpiValue>
              <KpiSubtext>Peer Review Score</KpiSubtext>
            </KpiCard>
          </PerformanceGrid>

          <GoalsSection>
            <GoalsHeader>
              <SectionTitle>
                <FaBullseye />
                Current Goals
              </SectionTitle>
            </GoalsHeader>
            <GoalsList>
              <GoalItem>
                <GoalInfo>
                  <GoalTitle>Complete Advanced Training</GoalTitle>
                  <GoalProgress>
                    <ProgressBar>
                      <ProgressFill progress={75} />
                    </ProgressBar>
                    75%
                  </GoalProgress>
                </GoalInfo>
                <GoalStatus status="in-progress">
                  <FaSpinner />
                  In Progress
                </GoalStatus>
              </GoalItem>
              <GoalItem>
                <GoalInfo>
                  <GoalTitle>Lead Team Project</GoalTitle>
                  <GoalProgress>
                    <ProgressBar>
                      <ProgressFill progress={100} />
                    </ProgressBar>
                    100%
                  </GoalProgress>
                </GoalInfo>
                <GoalStatus status="completed">
                  <FaCheckCircle />
                  Completed
                </GoalStatus>
              </GoalItem>
            </GoalsList>
          </GoalsSection>

          <AppraisalHistory>
            <SectionTitle>
              <FaHistory />
              Appraisal History
            </SectionTitle>
            <AppraisalList>
              <AppraisalItem>
                <AppraisalHeader>
                  <AppraisalDate>Q2 2023</AppraisalDate>
                  <AppraisalScore>
                    <FaTrophy />
                    4.5/5
                  </AppraisalScore>
                </AppraisalHeader>
                <AppraisalFeedback>
                  Excellent performance in team leadership and project delivery. Strong communication skills and technical expertise demonstrated throughout the quarter.
                </AppraisalFeedback>
              </AppraisalItem>
              <AppraisalItem>
                <AppraisalHeader>
                  <AppraisalDate>Q1 2023</AppraisalDate>
                  <AppraisalScore>
                    <FaTrophy />
                    4.2/5
                  </AppraisalScore>
                </AppraisalHeader>
                <AppraisalFeedback>
                  Consistent performance with notable improvements in time management. Good collaboration with team members.
                </AppraisalFeedback>
              </AppraisalItem>
            </AppraisalList>
          </AppraisalHistory>
        </PerformanceSection>

        <SelfServiceSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <SectionHeader>
            <SectionTitle>
              <FaCog />
              Self-Service Options
            </SectionTitle>
          </SectionHeader>

          <ServiceGrid>
            <ServiceCard>
              <ServiceIcon>
                <FaCalendarAlt />
              </ServiceIcon>
              <ServiceTitle>Request Leave</ServiceTitle>
              <ServiceDescription>
                Submit and track your time-off requests
              </ServiceDescription>
            </ServiceCard>

            <ServiceCard>
              <ServiceIcon>
                <FaFileUpload />
              </ServiceIcon>
              <ServiceTitle>Upload Documents</ServiceTitle>
              <ServiceDescription>
                Submit required documents and certificates
              </ServiceDescription>
            </ServiceCard>

            <ServiceCard>
              <ServiceIcon>
                <FaUserEdit />
              </ServiceIcon>
              <ServiceTitle>Update Profile</ServiceTitle>
              <ServiceDescription>
                Manage your personal information
              </ServiceDescription>
            </ServiceCard>
          </ServiceGrid>

          <DocumentSection>
            <SectionTitle>
              <FaFileAlt />
              Required Documents
            </SectionTitle>
            <DocumentList>
              <DocumentItem>
                <DocumentInfo>
                  <DocumentIcon>
                    <FaFileAlt />
                  </DocumentIcon>
                  <DocumentDetails>
                    <DocumentName>Medical Certificate</DocumentName>
                    <DocumentStatus>Last updated: 2 months ago</DocumentStatus>
                  </DocumentDetails>
                </DocumentInfo>
                <UploadButton>
                  <FaFileUpload />
                  Update
                </UploadButton>
              </DocumentItem>
              <DocumentItem>
                <DocumentInfo>
                  <DocumentIcon>
                    <FaFileAlt />
                  </DocumentIcon>
                  <DocumentDetails>
                    <DocumentName>ID Card</DocumentName>
                    <DocumentStatus>Last updated: 1 year ago</DocumentStatus>
                  </DocumentDetails>
                </DocumentInfo>
                <UploadButton>
                  <FaFileUpload />
                  Update
                </UploadButton>
              </DocumentItem>
            </DocumentList>
          </DocumentSection>

          <ProfileSection>
            <SectionTitle>
              <FaUserEdit />
              Quick Profile Updates
            </SectionTitle>
            <ProfileGrid>
              <ProfileItem>
                <ProfileIcon>
                  <FaPhone />
                </ProfileIcon>
                <ProfileInfo>
                  <ProfileLabel>Phone Number</ProfileLabel>
                  <ProfileValue>+1 (555) 123-4567</ProfileValue>
                </ProfileInfo>
              </ProfileItem>
              <ProfileItem>
                <ProfileIcon>
                  <FaEnvelope />
                </ProfileIcon>
                <ProfileInfo>
                  <ProfileLabel>Email Address</ProfileLabel>
                  <ProfileValue>employee@company.com</ProfileValue>
                </ProfileInfo>
              </ProfileItem>
              <ProfileItem>
                <ProfileIcon>
                  <FaMapMarkerAlt />
                </ProfileIcon>
                <ProfileInfo>
                  <ProfileLabel>Address</ProfileLabel>
                  <ProfileValue>123 Business St, City</ProfileValue>
                </ProfileInfo>
              </ProfileItem>
              <ProfileItem>
                <ProfileIcon>
                  <FaPhone />
                </ProfileIcon>
                <ProfileInfo>
                  <ProfileLabel>Emergency Contact</ProfileLabel>
                  <ProfileValue>+1 (555) 987-6543</ProfileValue>
                </ProfileInfo>
              </ProfileItem>
            </ProfileGrid>
          </ProfileSection>
        </SelfServiceSection>

        <QuickActionsSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <SectionHeader>
            <SectionTitle>
              <FaBolt />
              Quick Actions & Shortcuts
            </SectionTitle>
          </SectionHeader>

          <QuickActionsGrid>
            <QuickActionCard>
              <ActionIcon className="action-icon">
                <FaCalendarAlt />
              </ActionIcon>
              <ActionTitle className="action-title">Quick Leave Application</ActionTitle>
              <ActionDescription className="action-description">
                Apply for time off with just a few clicks. Fast and easy leave request process.
              </ActionDescription>
              <ActionButton className="action-button">
                <FaPlus />
                Apply Now
              </ActionButton>
              <ActionBadge>Fast Track</ActionBadge>
            </QuickActionCard>

            <QuickActionCard>
              <ActionIcon className="action-icon">
                <FaMoneyBillWave />
              </ActionIcon>
              <ActionTitle className="action-title">Payroll Information</ActionTitle>
              <ActionDescription className="action-description">
                View your latest payslip, salary details, and tax information in one place.
              </ActionDescription>
              <ActionButton className="action-button">
                <FaDownload />
                View Details
              </ActionButton>
              <ActionBadge>Updated</ActionBadge>
            </QuickActionCard>

            <QuickActionCard>
              <ActionIcon className="action-icon">
                <FaHeartbeat />
              </ActionIcon>
              <ActionTitle className="action-title">Wellness Programs</ActionTitle>
              <ActionDescription className="action-description">
                Join wellness activities, track your progress, and earn rewards.
              </ActionDescription>
              <ActionButton className="action-button">
                <FaPlus />
                Join Program
              </ActionButton>
              <ActionBadge>New</ActionBadge>
            </QuickActionCard>
          </QuickActionsGrid>
        </QuickActionsSection>

        <FeedbackSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <SectionHeader>
            <SectionTitle>
              <FaComments />
              Feedback & Support
            </SectionTitle>
          </SectionHeader>

          <FeedbackGrid>
            <FeedbackForm>
              <FormTitle>
                <FaComments />
                Provide Feedback
              </FormTitle>
              <FormGroup>
                <FormLabel>Feedback Category</FormLabel>
                <FormSelect>
                  <option value="">Select a category</option>
                  <option value="hr-services">HR Services</option>
                  <option value="wellness">Wellness Programs</option>
                  <option value="workplace">Workplace Experience</option>
                  <option value="other">Other</option>
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Your Feedback</FormLabel>
                <FormTextarea
                  placeholder="Share your thoughts, suggestions, or concerns..."
                />
              </FormGroup>
              <SubmitButton>
                <FaPaperPlane />
                Submit Feedback
              </SubmitButton>
            </FeedbackForm>

            <SupportCard>
              <SupportHeader>
                <SupportIcon>
                  <FaHeadset />
                </SupportIcon>
                <div>
                  <SupportTitle>Need HR Support?</SupportTitle>
                  <SupportDescription>
                    Our HR team is here to help you with any questions or concerns you may have.
                  </SupportDescription>
                </div>
              </SupportHeader>

              <SupportOptions>
                <SupportOption>
                  <FaComments />
                  Start Live Chat
                </SupportOption>
                <SupportOption>
                  <FaEnvelope />
                  Send Email
                </SupportOption>
                <SupportOption>
                  <FaPhone />
                  Schedule Call
                </SupportOption>
              </SupportOptions>
            </SupportCard>
          </FeedbackGrid>
        </FeedbackSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default EmployeeDashboard;