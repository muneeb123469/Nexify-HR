import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  FileText, 
  LogOut, 
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock4,
  Search,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Upload,
  Video,
  MapPin,
  Edit2,
  X,
  Check,
  Percent,
  Star,
  Award,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  FileUp,
  Calendar as CalendarIcon,
  Plus,
  Minus,
  MessageSquare,
  HelpCircle,
  Info,
  ChevronRight,
  BookOpen,
  PhoneCall,
  MessageCircle,
  Menu
} from 'lucide-react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import JobList from '../jobs/JobList';
import ApplicationList from '../applications/ApplicationList';
import InterviewHistory from '../interviews/InterviewHistory';
// import ResumeParsingInterface from '../recruitment/ResumeParsingInterface';
import './HRDashboard.css';
import './ApplicantDashboard.css';
import { useAuth } from '../../context/AuthContext';

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0 16px;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #4C9F9F #2C3E50;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #2C3E50;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4C9F9F;
    border-radius: 3px;
  }
`;

const MenuItem = styled.li`
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: #FFFFFF;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &:hover, &.active {
      background: #4C9F9F;
      color: #FFFFFF;
    }

    i {
      margin-right: 0;
      font-size: 1.2rem;
      width: auto;
      text-align: left;
      color: #FFFFFF;
    }
  }
`;

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    'Submitted': { color: 'bg-blue-100 text-blue-800', icon: FileText },
    'Under Review': { color: 'bg-yellow-100 text-yellow-800', icon: Clock4 },
    'Interview Scheduled': { color: 'bg-purple-100 text-purple-800', icon: Calendar },
    'Offer Extended': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const config = statusConfig[status] || statusConfig['Submitted'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
}

// Interview Schedule Component
function InterviewSchedule({ interviews }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2C3E50]">Upcoming Interviews</h3>
        <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
          <CalendarIcon size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        {interviews.map((interview) => (
          <div key={interview.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-[#2C3E50]">{interview.position}</h4>
                <p className="text-sm text-[#4C9F9F]">{interview.company}</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-[#4C9F9F] bg-[#E3F2FD] rounded-full">
                {interview.mode}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                {interview.date}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                {interview.time}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                {interview.mode === 'Virtual' ? (
                  <Video className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                ) : (
                  <MapPin className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                )}
                {interview.location || interview.platform}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button className="text-[#4C9F9F] hover:text-[#2A6F6F] flex items-center text-sm">
                <Download className="w-4 h-4 mr-1" />
                Calendar
              </button>
              <button className="text-[#4C9F9F] hover:text-[#2A6F6F] flex items-center text-sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile Management Component
function ProfileManagement({ profile, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    onUpdate(editedProfile);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-[#2C3E50]">Profile Management</h3>
          <div className="ml-4 flex items-center">
            <Percent className="w-4 h-4 mr-1 text-[#4C9F9F]" />
            <span className="text-sm font-medium text-[#4C9F9F]">{profile.completeness}% Complete</span>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[#4C9F9F] hover:text-[#2A6F6F]"
        >
          {isEditing ? <X size={20} /> : <Edit2 size={20} />}
        </button>
      </div>

      <div className="space-y-4">
        {/* Resume Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#4C9F9F]" />
              <span className="font-medium text-[#2C3E50]">Resume</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-[#4C9F9F] hover:text-[#2A6F6F] flex items-center text-sm">
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
              <label className="text-[#4C9F9F] hover:text-[#2A6F6F] flex items-center text-sm cursor-pointer">
                <Upload className="w-4 h-4 mr-1" />
                Update
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
              </label>
            </div>
          </div>
          <p className="text-sm text-gray-600">Last updated: {profile.resumeLastUpdated}</p>
        </div>

        {/* Profile Information */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-[#2C3E50] mb-3">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C9F9F]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C9F9F]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C9F9F]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4C9F9F]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                  <span className="text-sm text-[#2C3E50]">{profile.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                  <span className="text-sm text-[#2C3E50]">{profile.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                  <span className="text-sm text-[#2C3E50]">{profile.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                  <span className="text-sm text-[#2C3E50]">{profile.location}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-[#2C3E50]">Skills</h4>
            {isEditing && (
              <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
                <Plus size={20} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-[#E3F2FD] text-[#4C9F9F] rounded-full text-sm"
              >
                {skill}
                {isEditing && (
                  <button 
                    onClick={() => {
                      const newSkills = [...profile.skills];
                      newSkills.splice(index, 1);
                      setEditedProfile({...editedProfile, skills: newSkills});
                    }}
                    className="ml-1 text-[#4C9F9F] hover:text-[#2A6F6F]"
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => {
                setEditedProfile(profile);
                setIsEditing(false);
              }}
              className="px-4 py-2 text-sm font-medium text-[#2C3E50] bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4C9F9F] hover:bg-[#2A6F6F] rounded-md"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Update ApplicationCard component to be responsive
function ApplicationCard({ application, onViewDetails, onWithdraw, onUpdate, onRespondToOffer }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold text-[#2C3E50]">{application.position}</h3>
          <p className="text-sm text-[#4C9F9F]">{application.company}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-[#4C9F9F]" />
          Applied on {application.appliedDate}
        </div>
        {application.interviewDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-[#4C9F9F]" />
            Interview: {application.interviewDate}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-600">Job ID: {application.jobId}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onViewDetails(application)}
            className="text-[#4C9F9F] hover:text-[#2A6F6F] flex items-center text-sm font-medium"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          
          {application.status !== 'Rejected' && application.status !== 'Offer Extended' && (
            <button
              onClick={() => onWithdraw(application)}
              className="text-[#FF5A5A] hover:text-[#D32F2F] flex items-center text-sm font-medium"
            >
              <X className="w-4 h-4 mr-1" />
              Withdraw
            </button>
          )}
          
          {application.status === 'Offer Extended' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRespondToOffer(application, 'accept')}
                className="text-[#4C9F9F] hover:text-[#2A6F6F] flex items-center text-sm font-medium"
              >
                <Check className="w-4 h-4 mr-1" />
                Accept
              </button>
              <button
                onClick={() => onRespondToOffer(application, 'decline')}
                className="text-[#FF5A5A] hover:text-[#D32F2F] flex items-center text-sm font-medium"
              >
                <X className="w-4 h-4 mr-1" />
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Update ApplicationDetailsModal to be responsive
function ApplicationDetailsModal({ application, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#2C3E50]">{application.position}</h3>
            <p className="text-sm text-[#4C9F9F]">{application.company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-[#2C3E50] mb-2">Application Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Job ID</p>
                <p className="text-sm font-medium text-[#2C3E50]">{application.jobId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied Date</p>
                <p className="text-sm font-medium text-[#2C3E50]">{application.appliedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <StatusBadge status={application.status} />
              </div>
              {application.interviewDate && (
                <div>
                  <p className="text-sm text-gray-600">Interview Date</p>
                  <p className="text-sm font-medium text-[#2C3E50]">{application.interviewDate}</p>
                </div>
              )}
            </div>
          </div>

          {application.status === 'Interview Scheduled' && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-[#2C3E50] mb-2">Interview Details</h4>
              <div className="bg-[#E3F2FD] rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                    <span className="text-sm text-[#2C3E50]">{application.interviewDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                    <span className="text-sm text-[#2C3E50]">{application.interviewTime}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-[#4C9F9F]" />
                    <span className="text-sm text-[#2C3E50]">Interviewer: {application.interviewer}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {application.status === 'Offer Extended' && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-[#2C3E50] mb-2">Offer Details</h4>
              <div className="bg-[#E8F5E9] rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#2C3E50]">Salary</span>
                    <span className="text-sm font-medium text-[#4C9F9F]">{application.salary}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#2C3E50]">Start Date</span>
                    <span className="text-sm font-medium text-[#4C9F9F]">{application.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#2C3E50]">Offer Expires</span>
                    <span className="text-sm font-medium text-[#4C9F9F]">{application.offerExpiry}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Notifications Center Component
function NotificationsCenter({ notifications, onNotificationClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white hover:text-white/80"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#FF5A5A] rounded-full text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[#2C3E50]">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    onNotificationClick(notification);
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 text-left border-b border-gray-200 hover:bg-gray-50 ${
                    !notification.read ? 'bg-[#E3F2FD]' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {notification.type === 'application' && <FileText className="w-5 h-5 text-[#4C9F9F]" />}
                      {notification.type === 'interview' && <Calendar className="w-5 h-5 text-[#4C9F9F]" />}
                      {notification.type === 'offer' && <CheckCircle2 className="w-5 h-5 text-[#4C9F9F]" />}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-[#2C3E50]">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-200">
            <button className="w-full text-center text-sm text-[#4C9F9F] hover:text-[#2A6F6F] py-2">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Company Messages Component
function CompanyMessages({ applicantName }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2C3E50]">Welcome, {applicantName}!</h3>
        <Info className="w-5 h-5 text-[#4C9F9F]" />
      </div>

      <div className="space-y-4">
        <div className="bg-[#E3F2FD] rounded-lg p-4">
          <h4 className="font-medium text-[#2C3E50] mb-2">Helpful Resources</h4>
          <div className="space-y-2">
            <a href="#" className="flex items-center text-[#4C9F9F] hover:text-[#2A6F6F]">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>Interview Preparation Tips</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </a>
            <a href="#" className="flex items-center text-[#4C9F9F] hover:text-[#2A6F6F]">
              <Info className="w-4 h-4 mr-2" />
              <span>Company Hiring Process</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </a>
            <a href="#" className="flex items-center text-[#4C9F9F] hover:text-[#2A6F6F]">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span>Frequently Asked Questions</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <PhoneCall className="w-4 h-4 mr-2 text-[#4C9F9F]" />
            <span>Need help? Contact HR</span>
          </div>
          <button className="text-[#4C9F9F] hover:text-[#2A6F6F] flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat with us
          </button>
        </div>
      </div>
    </div>
  );
}

// Add SidebarItem component for better organization
function SidebarItem({ icon, text, active = false, onClick }) {
  return (
    <button 
      className={`w-full flex items-center p-3 rounded-md transition-all duration-200 ${
        active 
          ? 'bg-[#4C9F9F] text-white' 
          : 'text-gray-300 hover:bg-[#4C9F9F]/50 hover:text-white'
      }`}
      onClick={onClick}
    >
      <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
      <span className="ml-3 text-sm lg:text-base font-medium">{text}</span>
    </button>
  );
}

// Add MobileSidebar component
function MobileSidebar({ isOpen, onClose, children }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-[#2C3E50] z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {children}
      </div>
    </>
  );
}

const ApplicantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    completeness: 85,
    resumeLastUpdated: '2024-03-15',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker']
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'application',
      title: 'Application Status Updated',
      message: 'Your application for Senior Software Engineer is now Under Review',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'interview',
      title: 'Interview Scheduled',
      message: 'Interview scheduled for Product Manager position on March 28, 2024',
      time: '1 day ago',
      read: false
    },
    {
      id: 3,
      type: 'offer',
      title: 'Offer Extended',
      message: 'Congratulations! You\'ve received an offer for UX Designer position',
      time: '3 days ago',
      read: true
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('applications');

  // Mock data for applications
  const applications = [
    {
      id: 1,
      position: 'Senior Software Engineer',
      company: 'Tech Corp',
      jobId: 'TC-SE-2024',
      status: 'Under Review',
      appliedDate: '2024-03-15',
      interviewDate: '2024-03-25',
      interviewTime: '10:00 AM',
      interviewer: 'John Smith'
    },
    {
      id: 2,
      position: 'Product Manager',
      company: 'Innovate Inc',
      jobId: 'II-PM-2024',
      status: 'Interview Scheduled',
      appliedDate: '2024-03-10',
      interviewDate: '2024-03-28',
      interviewTime: '2:00 PM',
      interviewer: 'Sarah Johnson'
    },
    {
      id: 3,
      position: 'UX Designer',
      company: 'Design Studio',
      jobId: 'DS-UX-2024',
      status: 'Offer Extended',
      appliedDate: '2024-03-05',
      salary: '$85,000',
      startDate: '2024-04-15',
      offerExpiry: '2024-03-30'
    },
    {
      id: 4,
      position: 'Data Analyst',
      company: 'Data Corp',
      jobId: 'DC-DA-2024',
      status: 'Rejected',
      appliedDate: '2024-03-01'
    }
  ];

  // Mock data for interviews
  const interviews = [
    {
      id: 1,
      position: 'Senior Software Engineer',
      company: 'Tech Corp',
      date: 'March 25, 2024',
      time: '10:00 AM',
      mode: 'Virtual',
      platform: 'Zoom',
      location: null
    },
    {
      id: 2,
      position: 'Product Manager',
      company: 'Innovate Inc',
      date: 'March 28, 2024',
      time: '2:00 PM',
      mode: 'In-person',
      platform: null,
      location: '123 Tech Street, San Francisco, CA'
    }
  ];

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    // Here you would typically make an API call to update the profile
  };

  const handleWithdrawApplication = (application) => {
    // Here you would typically make an API call to withdraw the application
    console.log('Withdrawing application:', application);
  };

  const handleRespondToOffer = (application, response) => {
    // Here you would typically make an API call to respond to the offer
    console.log('Responding to offer:', application, response);
  };

  const handleNotificationClick = (notification) => {
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    // Handle notification click (e.g., navigate to relevant page)
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredApplications = applications.filter(app => 
    app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.jobId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="applicant-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h1>Nexify<span>HR</span></h1>
        </div>
        
        <SidebarMenu>
          <MenuItem>
            <NavLink to="/applicant-dashboard" end>
              <i className="fas fa-home"></i>
              Dashboard
            </NavLink>
          </MenuItem>
          <MenuItem>
            <NavLink to="/jobs">
              <i className="fas fa-briefcase"></i>
              Browse Jobs
            </NavLink>
          </MenuItem>
          <MenuItem>
            <NavLink to="/applicant-dashboard/applications">
              <i className="fas fa-file-alt"></i>
              My Applications
            </NavLink>
          </MenuItem>
          <MenuItem>
            <NavLink to="/applicant-dashboard/interviews">
              <i className="fas fa-calendar-alt"></i>
              Interview History
            </NavLink>
          </MenuItem>
          <MenuItem>
            <NavLink to="/self-service/personal-info">
              <i className="fas fa-user"></i>
              My Profile
            </NavLink>
          </MenuItem>
          {/* <MenuItem>
            <NavLink to="/applicant-dashboard/resume-parsing">
              <i className="fas fa-file-upload"></i>
              Resume Parsing
            </NavLink>
          </MenuItem> */}
        </SidebarMenu>

        <div className="logout">
          <button onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div className="search">
            <input type="text" placeholder="Search..." />
            <i className="fas fa-search"></i>
          </div>
          <div className="user-info">
            <div className="notifications">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </div>
            <div className="user">
              <img src={user?.profileImage || 'https://via.placeholder.com/32'} alt="Profile" />
              <span>{user?.name || 'User'}</span>
            </div>
          </div>
        </div>

        <div className="content">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/applications" element={<ApplicationList />} />
            <Route path="/interviews" element={<InterviewHistory />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/resume-parsing" element={<ResumeParsingInterface />} /> */}
          </Routes>
        </div>
      </div>

      {/* Application Details Modal - Responsive */}
      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = () => {
  return (
    <div className="dashboard-overview">
      <h2>Welcome to Your Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-briefcase"></i>
          <h3>Active Applications</h3>
          <p>5</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-calendar-check"></i>
          <h3>Upcoming Interviews</h3>
          <p>2</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle"></i>
          <h3>Completed Interviews</h3>
          <p>3</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-file-alt"></i>
          <h3>Total Applications</h3>
          <p>10</p>
        </div>
      </div>
    </div>
  );
};

// Profile Component
const Profile = () => {
  return (
    <div className="profile-section">
      <h2>My Profile</h2>
      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-header">
            <img src="https://via.placeholder.com/100" alt="Profile" />
            <div>
              <h3>John Doe</h3>
              <p>Software Engineer</p>
            </div>
          </div>
          <div className="profile-details">
            <div className="detail-item">
              <i className="fas fa-envelope"></i>
              <span>john.doe@example.com</span>
            </div>
            <div className="detail-item">
              <i className="fas fa-phone"></i>
              <span>+1 234 567 890</span>
            </div>
            <div className="detail-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>New York, USA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;