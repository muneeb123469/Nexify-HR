import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ApplicationProvider } from './context/ApplicationContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import JobList from './components/jobs/JobList';
import JobForm from './components/jobs/JobForm';
import JobDetails from './components/jobs/JobDetails';
import ApplicationList from './components/applications/ApplicationList';
import ApplicationForm from './components/applications/ApplicationForm';
import Register from './components/auth/Register';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import HRDashboard from './components/dashboard/HRDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ApplicantDashboard from './components/dashboard/ApplicantDashboard';
import TwoFactorAuthentication from './components/user-management/TwoFactorAuth';
import UserRoles from './components/user-management/UserRolesPermissions';
import Applications from './components/applications/Applications';
// HR Management Components
import JobPostingsDashboard from './components/recruitment/JobPostingsDashboard';
import CandidateApplicationManagement from './components/recruitment/CandidateApplicationManagement';
import CandidateProfile from './components/recruitment/CandidateProfile';
import ResumeParsingInterface from './components/recruitment/ResumeParsingInterface';
import InterviewSchedulingInterface from './components/recruitment/InterviewSchedulingInterface';
import InterviewFeedbackRecording from './components/recruitment/InterviewFeedbackRecording';
import OfferLetterGeneration from './components/recruitment/OfferLetterGeneration';

// Employee Management Components
import EmployeeManagement from './components/employee-management/EmployeeManagement';
import EmployeeDatabaseManagement from './components/employee-management/EmployeeDatabaseManagement';
import NewEmployeeProfile from './components/employee-management/NewEmployeeProfile';
import EmployeeProfileManagement from './components/employee-management/EmployeeProfileManagement';
import EmployeeClassification from './components/employee-management/EmployeeClassification';
import PayrollTaxManagement from './components/employee-management/PayrollTaxManagement';
import SalaryCalculation from './components/payroll-management/SalaryCalculation';
import PayslipGeneration from './components/payroll-management/PayslipGeneration';
import InterviewHistory from './components/interviews/InterviewHistory';
import Meeting from './components/interviews/Meeting';
// Performance and Analytics Components
import GoalSettingDashboard from './components/performance-analytics/GoalSettingDashboard';

// Personal Information Management Component
import PersonalInformationManagement from './components/self-service/PersonalInformationManagement';

// Remote Work & Performance Management Components
import WellnessFitnessDashboard from './components/remote-work/WellnessFitnessDashboard';
import RemoteWorkHoursTracker from './components/remote-work/RemoteWorkHoursTracker';

// Leave and Attendance Components
import LeaveRequest from './components/leave/LeaveRequest';
import LeaveManagement from './components/leave/LeaveManagement';
import HRLeaveRequests from './components/leave/HRLeaveRequests';
import AttendanceOverview from './components/attendance/AttendanceOverview';
import HRAttendanceView from './components/attendance/HRAttendanceView';

// Admin Components
import HRApprovalList from './components/admin/HRApprovalList';
import LocationSettings from './components/admin/LocationSettings';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <JobProvider>
          <ApplicationProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/new" element={<JobForm />} />
              <Route path="/hr/jobs/create" element={<JobForm />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/jobs/:id/apply" element={<ApplicationForm />} />
              <Route path="/applications" element={<ApplicationList />} />
              <Route path="/applicant-dashboard/applications" element={<ApplicationList />} />
              <Route path="/applications/new/:id" element={<ApplicationForm />} />
              <Route path="/dashboard" element={<HRDashboard />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
              <Route path='/user-roles' element={<UserRoles/>}/>
              <Route path='/two-factor-authentication' element={<TwoFactorAuthentication/>}/>
              <Route path="/applicant-dashboard/interviews" element={<InterviewHistory />} />
              <Route path="/applicant-dashboard/resume-parsing" element={<ResumeParsingInterface />} />
              <Route path="/meetings/:receiverId" element={<Meeting />} />
              <Route path="/meetings" element={<Meeting />} />
              {/* HR Management Routes */}
              <Route path="/hr/job-postings" element={<JobPostingsDashboard />} />
              <Route path="/hr/candidate-applications/:jobId?" element={<CandidateApplicationManagement />} />
              <Route path="/hr/candidate-profile/:applicationId" element={<CandidateProfile />} />
              <Route path="/hr/interview-scheduling" element={<InterviewSchedulingInterface />} />
              <Route path="/hr/interview-feedback" element={<InterviewFeedbackRecording />} />
              <Route path="/hr/offer-letters" element={<OfferLetterGeneration />} />

              {/* Employee Management Routes */}
              <Route path="/employee/management" element={<EmployeeManagement />} />
              <Route path="/employee/database" element={<EmployeeDatabaseManagement />} />
              <Route path="/employee/new-profile" element={<NewEmployeeProfile />} />
              <Route path="/employee/profile-management" element={<EmployeeProfileManagement />} />
              <Route path="/employee/classification" element={<EmployeeClassification />} />
              <Route path="/employee/payroll-tax" element={<PayrollTaxManagement />} />
              <Route path="/payroll/salary-calculation" element={<SalaryCalculation />} />
              <Route path="/payroll/payslip-generation" element={<PayslipGeneration />} />

              {/* Performance and Analytics Routes */}
              <Route path="/performance/goal-setting" element={<GoalSettingDashboard />} />

              {/* Personal Information Management Route */}
              <Route path="/self-service/personal-info" element={<PersonalInformationManagement />} />
              <Route path="/applicant/profile" element={<PersonalInformationManagement />} />

              {/* Remote Work & Performance Management Routes */}
              <Route path="/remote-work/wellness-fitness" element={<WellnessFitnessDashboard />} />
              <Route path="/remote-work/hours-tracker" element={<RemoteWorkHoursTracker />} />

              {/* Leave and Attendance Routes */}
              <Route path="/employee/leave-request" element={<LeaveManagement />} />
              <Route path="/employee/attendance" element={<AttendanceOverview />} />
              <Route path="/hr/attendance" element={<HRAttendanceView />} />
              <Route path="/hr/leave-requests" element={<HRLeaveRequests />} />

              {/* Admin Routes */}
              <Route path="/admin/hr-approvals" element={<HRApprovalList />} />
              <Route path="/admin/settings" element={<LocationSettings />} />
            </Routes>
          </ApplicationProvider>
        </JobProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
