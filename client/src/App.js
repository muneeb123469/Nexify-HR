import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ApplicationList from "./components/applications/ApplicationList";
import { ApplicationProvider } from "./context/ApplicationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { JobProvider } from "./context/JobContext";
import Login from "./components/auth/Login";
import JobList from "./components/jobs/JobList";
import JobForm from "./components/jobs/JobForm";
import JobDetails from "./components/jobs/JobDetails";
import ApplicationForm from "./components/applications/ApplicationForm";
import Register from "./components/auth/Register";
import ApplicantDashboard from "./components/dashboard/ApplicantDashboard";
import HRDashboard from "./components/dashboard/HRDashboard";
import EmployeeDashboard from "./components/dashboard/EmployeeDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";
// HR Management Components
import JobPostingsDashboard from "./components/recruitment/JobPostingsDashboard";
import CandidateApplicationManagement from "./components/recruitment/CandidateApplicationManagement";
import ResumeParsingInterface from "./components/recruitment/ResumeParsingInterface";
import InterviewSchedulingInterface from "./components/recruitment/InterviewSchedulingInterface";
import InterviewFeedbackRecording from "./components/recruitment/InterviewFeedbackRecording";
import OfferLetterGeneration from "./components/recruitment/OfferLetterGeneration";

// Employee Management Components
import EmployeeDatabaseManagement from "./components/employee-management/EmployeeDatabaseManagement";
import NewEmployeeProfile from "./components/employee-management/NewEmployeeProfile";
import EmployeeProfileManagement from "./components/employee-management/EmployeeProfileManagement";
import EmployeeClassification from "./components/employee-management/EmployeeClassification";
import PayrollTaxManagement from "./components/employee-management/PayrollTaxManagement";
import SalaryCalculation from "./components/payroll-management/SalaryCalculation";
import PayslipGeneration from "./components/payroll-management/PayslipGeneration";
import InterviewHistory from "./components/interviews/InterviewHistory";
// Performance and Analytics Components
import GoalSettingDashboard from "./components/performance-analytics/GoalSettingDashboard";

// Personal Information Management Component
import PersonalInformationManagement from "./components/self-service/PersonalInformationManagement";

// Remote Work & Performance Management Components
import WellnessFitnessDashboard from "./components/remote-work/WellnessFitnessDashboard";
import RemoteWorkHoursTracker from "./components/remote-work/RemoteWorkHoursTracker";

// Leave and Attendance Components
import LeaveRequest from "./components/leave/LeaveRequest";
import AttendanceOverview from "./components/attendance/AttendanceOverview";

// Admin Components
import HRApprovalList from "./components/admin/HRApprovalList";
import UserRolesPermissions from "./components/user-management/UserRolesPermissions";

const roleDashboardPaths = {
  applicant: "/applicant-dashboard",
  hr: "/hr/dashboard",
  employee: "/employee-dashboard",
  admin: "/admin-dashboard",
};

const getDashboardPath = (role) => roleDashboardPaths[role] || "/login";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
};

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <JobProvider>
          <ApplicationProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Navigate to="/register" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobList />} />
              <Route
                path="/jobs/new"
                element={
                  <ProtectedRoute roles={["hr", "admin"]}>
                    <JobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/jobs/create"
                element={
                  <ProtectedRoute roles={["hr", "admin"]}>
                    <JobForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/new/:id"
                element={
                  <ProtectedRoute roles="applicant">
                    <ApplicationForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applicant-dashboard"
                element={
                  <ProtectedRoute roles="applicant">
                    <ApplicantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route
                path="/hr/dashboard/*"
                element={
                  <ProtectedRoute roles="hr">
                    <HRDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee-dashboard"
                element={
                  <ProtectedRoute roles="employee">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute roles="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route
                path="/applicant-dashboard/interviews"
                element={
                  <ProtectedRoute roles="applicant">
                    <InterviewHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applicant-dashboard/applications"
                element={
                  <ProtectedRoute roles="applicant">
                    <ApplicationList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applicant-dashboard/resume-parsing"
                element={
                  <ProtectedRoute roles="applicant">
                    <ResumeParsingInterface />
                  </ProtectedRoute>
                }
              />
              {/* HR Management Routes */}
              <Route
                path="/hr/job-postings"
                element={
                  <ProtectedRoute roles={["hr", "admin"]}>
                    <JobPostingsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/candidate-applications"
                element={
                  <ProtectedRoute roles={["hr", "admin"]}>
                    <CandidateApplicationManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/interview-scheduling"
                element={
                  <ProtectedRoute roles={["hr", "admin"]}>
                    <InterviewSchedulingInterface />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/interview-feedback"
                element={
                  <ProtectedRoute roles={["hr", "admin"]}>
                    <InterviewFeedbackRecording />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/offer-letters"
                element={
                  <ProtectedRoute roles={["hr", "admin"]}>
                    <OfferLetterGeneration />
                  </ProtectedRoute>
                }
              />

              {/* Employee Management Routes */}
              <Route
                path="/employee/database"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <EmployeeDatabaseManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/new-profile"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <NewEmployeeProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/profile-management"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <EmployeeProfileManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/classification"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <EmployeeClassification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/payroll-tax"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <PayrollTaxManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payroll/salary-calculation"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <SalaryCalculation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payroll/payslip-generation"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <PayslipGeneration />
                  </ProtectedRoute>
                }
              />

              {/* Performance and Analytics Routes */}
              <Route
                path="/performance/goal-setting"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <GoalSettingDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Personal Information Management Route */}
              <Route
                path="/self-service/personal-info"
                element={
                  <ProtectedRoute roles="employee">
                    <PersonalInformationManagement />
                  </ProtectedRoute>
                }
              />

              {/* Remote Work & Performance Management Routes */}
              <Route
                path="/remote-work/wellness-fitness"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <WellnessFitnessDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/remote-work/hours-tracker"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <RemoteWorkHoursTracker />
                  </ProtectedRoute>
                }
              />

              {/* Leave and Attendance Routes */}
              <Route
                path="/employee/leave-request"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <LeaveRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/attendance"
                element={
                  <ProtectedRoute roles={["employee", "hr", "admin"]}>
                    <AttendanceOverview />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/hr-approvals"
                element={
                  <ProtectedRoute roles="admin">
                    <HRApprovalList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-roles"
                element={
                  <ProtectedRoute roles="admin">
                    <UserRolesPermissions />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ApplicationProvider>
        </JobProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
