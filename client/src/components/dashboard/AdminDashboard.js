import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  ChevronDown,
  ChevronUp,
  DollarSign, 
  Home, 
  LogOut, 
  MessageSquare, 
  Settings, 
  Sun, 
  User, 
  Users, 
  FileText,
  Activity,
  HelpCircle,
  Shield,
  AlertCircle,
  PieChart,
  BarChart,
  LineChart,
  Lock,
  Cloud,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Search,
  Database,
  Server,
  Key,
  UserCheck,
  UserX,
  AlertTriangle,
  Briefcase,
  Building2,
  FileCheck,
  FileX,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  ChevronRight,
  ChevronLeft,
  Plus,
  Filter,
  Menu,
  X,
  UserPlus,
  Calculator,
  Target,
  Clock
} from 'lucide-react';
import HRApprovalList from '../admin/HRApprovalList';
import './HRDashboard.css';

// Helper Components
function SidebarItem({ icon, text, active = false, onClick }) {
  return (
    <button 
      className={`w-full flex items-center p-3 rounded-md transition-all duration-200 ${
        active 
          ? 'bg-[#4C9F9F] text-white shadow-lg' 
          : 'text-gray-300 hover:bg-[#4C9F9F]/50 hover:text-white'
      }`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
      <span className="ml-3 text-sm lg:text-base font-medium">{text}</span>
    </button>
  );
}

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

function StatCard({ title, value, icon, color, trend, subtitle }) {
  return (
    <div className="bg-[#f0f9ff] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#4C9F9F] text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-[#2C3E50]">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-[#4C9F9F]' : 'text-[#FF5A5A]'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
          {subtitle && (
            <p className="text-sm text-[#4b5563] mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </div>
  );
}

function UserRolePieChart() {
  const userRoles = [
    { role: 'Admin', count: 5, color: '#4C9F9F' },
    { role: 'HR', count: 10, color: '#2C3E50' },
    { role: 'Employee', count: 50, color: '#A5D8D0' },
    { role: 'Applicant', count: 25, color: '#FF5A5A' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2C3E50]">User Role Distribution</h3>
        <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
          <Filter size={20} />
        </button>
      </div>
      <div className="h-64 flex items-center justify-center">
        <PieChart size={48} className="text-[#4C9F9F]" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {userRoles.map((role) => (
          <div key={role.role} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: role.color }}
              />
              <span className="text-sm text-[#2C3E50]">{role.role}</span>
            </div>
            <span className="text-sm font-medium">{role.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityStatusCard() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Shield className="text-[#4C9F9F] mr-2" size={24} />
          <h3 className="text-lg font-semibold text-[#2C3E50]">Security Status</h3>
        </div>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-[#4C9F9F] hover:text-[#2A6F6F]"
        >
          {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-[#E8F5E9] rounded-lg">
          <div className="flex items-center">
            <Key className="text-[#4C9F9F] mr-2" size={20} />
            <span className="text-sm text-[#2C3E50]">2FA Enabled</span>
          </div>
          <span className="text-sm font-medium text-[#4C9F9F]">85%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#E3F2FD] rounded-lg">
          <div className="flex items-center">
            <UserCheck className="text-[#4C9F9F] mr-2" size={20} />
            <span className="text-sm text-[#2C3E50]">Active Sessions</span>
          </div>
          <span className="text-sm font-medium text-[#4C9F9F]">24</span>
        </div>
        {showDetails && (
          <>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-[#2C3E50] mb-2">JWT Sessions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#2C3E50]">Admin Session</span>
                  <span className="text-[#4C9F9F]">Expires in 2h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#2C3E50]">HR Session</span>
                  <span className="text-[#4C9F9F]">Expires in 4h</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-[#2C3E50] mb-2">Recent Unauthorized Attempts</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#2C3E50]">Failed Login (10:30 AM)</span>
                  <span className="text-[#FF5A5A]">Blocked</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#2C3E50]">Invalid Token (09:15 AM)</span>
                  <span className="text-[#FF5A5A]">Blocked</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AWSStatusCard() {
  const services = [
    { name: 'EC2', status: 'Healthy', icon: Server },
    { name: 'S3', status: 'Healthy', icon: Database },
    { name: 'RDS', status: 'Healthy', icon: Cloud }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center mb-4">
        <Cloud className="text-[#4C9F9F] mr-2" size={24} />
        <h3 className="text-lg font-semibold text-[#2C3E50]">AWS Services Status</h3>
      </div>
      <div className="space-y-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.name} className="flex items-center justify-between p-3 bg-[#E3F2FD] rounded-lg">
              <div className="flex items-center">
                <Icon className="text-[#4C9F9F] mr-2" size={20} />
                <span className="text-sm text-[#2C3E50]">{service.name}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="text-[#4C9F9F] mr-1" size={16} />
                <span className="text-sm font-medium text-[#4C9F9F]">{service.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserPermissionsModal({ user, onClose, onSave }) {
  const [permissions, setPermissions] = useState({
    payroll: {
      view: false,
      edit: false,
      approve: false
    },
    leave: {
      view: false,
      edit: false,
      approve: false
    },
    employeeProfiles: {
      view: false,
      edit: false
    },
    recruitment: {
      view: false,
      edit: false,
      approve: false
    },
    compliance: {
      view: false,
      edit: false
    }
  });

  const handlePermissionChange = (module, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-[#2C3E50]">User Permissions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#2C3E50]">User: {user?.name}</span>
            <span className="text-sm text-[#4C9F9F]">Role: {user?.role}</span>
          </div>
          
          {Object.entries(permissions).map(([module, modulePermissions]) => (
            <div key={module} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-[#2C3E50] mb-3 capitalize">{module.replace(/([A-Z])/g, ' $1')}</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(modulePermissions).map(([permission, value]) => (
                  <label key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handlePermissionChange(module, permission, e.target.checked)}
                      className="rounded border-gray-300 text-[#4C9F9F] focus:ring-[#4C9F9F]"
                    />
                    <span className="text-sm text-[#2C3E50] capitalize">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end space-x-3 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#2C3E50] bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(permissions)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4C9F9F] hover:bg-[#2A6F6F] rounded-md"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TwoFactorAuthModal({ user, onClose, onSave }) {
  const [twoFactorMethod, setTwoFactorMethod] = useState('none');
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h3 className="text-lg font-semibold mb-4 text-[#2C3E50]">Two-Factor Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#2C3E50]">User: {user?.name}</span>
            <div className="flex items-center">
              <span className="text-sm text-[#2C3E50] mr-2">Status:</span>
              <span className={`text-sm font-medium ${isEnabled ? 'text-[#4C9F9F]' : 'text-[#FF5A5A]'}`}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded border-gray-300 text-[#4C9F9F] focus:ring-[#4C9F9F]"
              />
              <span className="text-sm text-[#2C3E50]">Enable Two-Factor Authentication</span>
            </label>

            {isEnabled && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2C3E50]">Authentication Method</label>
                <select
                  value={twoFactorMethod}
                  onChange={(e) => setTwoFactorMethod(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#4C9F9F] focus:border-[#4C9F9F] sm:text-sm rounded-md"
                >
                  <option value="none">Select Method</option>
                  <option value="otp">SMS OTP</option>
                  <option value="authenticator">Authenticator App</option>
                  <option value="email">Email OTP</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#2C3E50] bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave({ isEnabled, method: twoFactorMethod })}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4C9F9F] hover:bg-[#2A6F6F] rounded-md"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserTable() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    { 
      id: 1, 
      name: 'Ammar Ali', 
      role: 'Admin', 
      lastLogin: '2024-03-20 10:30', 
      status: 'Active',
      twoFactorEnabled: true,
      twoFactorMethod: 'authenticator'
    },
    { 
      id: 2, 
      name: 'Amna Kamaal', 
      role: 'HR', 
      lastLogin: '2024-03-20 09:15', 
      status: 'Active',
      twoFactorEnabled: false,
      twoFactorMethod: null
    },
    { 
      id: 3, 
      name: 'Hassan Khalid', 
      role: 'Employee', 
      lastLogin: '2024-03-19 16:45', 
      status: 'Inactive',
      twoFactorEnabled: true,
      twoFactorMethod: 'otp'
    }
  ];

  const handleRoleEdit = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handlePermissionsEdit = (user) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#2C3E50]">User Management</h3>
        <button className="flex items-center text-[#4C9F9F] hover:text-[#2A6F6F]">
          <Plus size={20} className="mr-1" />
          Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2C3E50] uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2C3E50] uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2C3E50] uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2C3E50] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2C3E50] uppercase tracking-wider">2FA</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#2C3E50] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                        <span className="text-[#4C9F9F] font-medium">{user.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-[#2C3E50]">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#E3F2FD] text-[#4C9F9F]">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3E50]">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.status === 'Active' ? (
                      <CheckCircle2 className="text-[#4C9F9F] mr-1" size={16} />
                    ) : (
                      <XCircle className="text-[#FF5A5A] mr-1" size={16} />
                    )}
                    <span className={`text-sm font-medium ${
                      user.status === 'Active' ? 'text-[#4C9F9F]' : 'text-[#FF5A5A]'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.twoFactorEnabled ? (
                      <CheckCircle2 className="text-[#4C9F9F] mr-1" size={16} />
                    ) : (
                      <XCircle className="text-[#FF5A5A] mr-1" size={16} />
                    )}
                    <span className={`text-sm font-medium ${
                      user.twoFactorEnabled ? 'text-[#4C9F9F]' : 'text-[#FF5A5A]'
                    }`}>
                      {user.twoFactorEnabled ? user.twoFactorMethod : 'Disabled'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleRoleEdit(user)}
                    className="text-[#4C9F9F] hover:text-[#2A6F6F] mr-3 transition-colors duration-200"
                    title="Edit Role"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handlePermissionsEdit(user)}
                    className="text-[#4C9F9F] hover:text-[#2A6F6F] mr-3 transition-colors duration-200"
                    title="Edit Permissions"
                  >
                    <Shield size={16} />
                  </button>
                  <button 
                    onClick={() => handle2FAEdit(user)}
                    className="text-[#4C9F9F] hover:text-[#2A6F6F] mr-3 transition-colors duration-200"
                    title="Manage 2FA"
                  >
                    <Lock size={16} />
                  </button>
                  <button className="text-[#FF5A5A] hover:text-[#D32F2F] transition-colors duration-200" title="Delete User">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Edit Modal */}
      {showRoleModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-modal-title"
        >
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 id="role-modal-title" className="text-lg font-semibold mb-4 text-[#2C3E50]">Edit User Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  User
                </label>
                <div className="text-sm text-[#2C3E50]">{selectedUser?.name}</div>
              </div>
              <div>
              <div className="text-sm text-[#2C3E50]">{selectedUser?.role}</div>
              </div>
              <div>
                <label htmlFor="new-role" className="block text-sm font-medium text-[#2C3E50] mb-1">
                  New Role
                </label>
                <select 
                  id="new-role"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#4C9F9F] focus:border-[#4C9F9F] sm:text-sm rounded-md"
                >
                  <option>Admin</option>
                  <option>HR</option>
                  <option>Employee</option>
                  <option>Applicant</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#2C3E50] bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4C9F9F] hover:bg-[#2A6F6F] rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {show2FAModal && (
        <TwoFactorAuthModal
          user={selectedUser}
          onClose={() => setShow2FAModal(false)}
          onSave={(settings) => {
            console.log('Saving 2FA settings:', settings);
            setShow2FAModal(false);
          }}
        />
      )}
    </div>
  );
}

function RecruitmentOverview() {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Briefcase className="text-[#4C9F9F] mr-2" size={24} />
          <h3 className="text-lg font-semibold text-[#2C3E50]">Recruitment Overview</h3>
        </div>
        <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
          <Filter size={20} />
        </button>
      </div>
      
      {/* Job Postings Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#E8F5E9] p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">Active Postings</div>
          <div className="text-xl font-semibold text-[#4C9F9F]">12</div>
        </div>
        <div className="bg-[#FFF3E0] p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">Expired</div>
          <div className="text-xl font-semibold text-[#FFB400]">5</div>
        </div>
        <div className="bg-[#E3F2FD] p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">Upcoming</div>
          <div className="text-xl font-semibold text-[#4C9F9F]">3</div>
        </div>
      </div>

      {/* Candidate Pipeline */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Candidate Pipeline</h4>
        <div className="h-32 flex items-end space-x-2">
          <div className="flex-1 bg-[#E3F2FD] rounded-t-lg" style={{ height: '60%' }}>
            <div className="text-center text-xs text-[#2C3E50] mt-1">Applied</div>
            <div className="text-center text-sm font-medium">150</div>
          </div>
          <div className="flex-1 bg-[#BBDEFB] rounded-t-lg" style={{ height: '40%' }}>
            <div className="text-center text-xs text-[#2C3E50] mt-1">Shortlisted</div>
            <div className="text-center text-sm font-medium">45</div>
          </div>
          <div className="flex-1 bg-[#90CAF9] rounded-t-lg" style={{ height: '30%' }}>
            <div className="text-center text-xs text-[#2C3E50] mt-1">Interviewed</div>
            <div className="text-center text-sm font-medium">25</div>
          </div>
          <div className="flex-1 bg-[#64B5F6] rounded-t-lg" style={{ height: '20%' }}>
            <div className="text-center text-xs text-[#2C3E50] mt-1">Offered</div>
            <div className="text-center text-sm font-medium">10</div>
          </div>
          <div className="flex-1 bg-[#4C9F9F] rounded-t-lg" style={{ height: '10%' }}>
            <div className="text-center text-xs text-white mt-1">Hired</div>
            <div className="text-center text-sm font-medium text-white">5</div>
          </div>
        </div>
      </div>

      {/* Failed Resume Parses */}
      <div>
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Failed Resume Parses</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-[#FFEBEE] rounded-lg">
            <div className="flex items-center">
              <FileX className="text-[#FF5A5A] mr-2" size={16} />
              <span className="text-sm text-[#2C3E50]">resume_john_doe.pdf</span>
            </div>
            <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
              <Download size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#FFEBEE] rounded-lg">
            <div className="flex items-center">
              <FileX className="text-[#FF5A5A] mr-2" size={16} />
              <span className="text-sm text-[#2C3E50]">resume_jane_smith.pdf</span>
            </div>
            <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeRecords() {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Building2 className="text-[#4C9F9F] mr-2" size={24} />
          <h3 className="text-lg font-semibold text-[#2C3E50]">Employee Records</h3>
        </div>
        <button className="flex items-center text-[#4C9F9F] hover:text-[#2A6F6F]">
          <Plus size={20} className="mr-1" />
          Add Employee
        </button>
      </div>

      {/* Organizational Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Organizational Structure</h4>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-[#E3F2FD] rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="text-[#4C9F9F]" size={32} />
              </div>
              <div className="text-sm font-medium text-[#2C3E50]">CEO</div>
              <div className="text-xs text-[#4C9F9F]">John Smith</div>
            </div>
          </div>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="text-[#4C9F9F]" size={24} />
              </div>
              <div className="text-sm font-medium text-[#2C3E50]">HR</div>
              <div className="text-xs text-[#4C9F9F]">Jane Doe</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#E3F2FD] rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="text-[#4C9F9F]" size={24} />
              </div>
              <div className="text-sm font-medium text-[#2C3E50]">IT</div>
              <div className="text-xs text-[#4C9F9F]">Mike Johnson</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="text-[#4C9F9F]" size={24} />
              </div>
              <div className="text-sm font-medium text-[#2C3E50]">Finance</div>
              <div className="text-xs text-[#4C9F9F]">Sarah Wilson</div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Profile Management */}
      <div>
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Recent Updates</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-[#E3F2FD] rounded-lg">
            <div className="flex items-center">
              <FileCheck className="text-[#4C9F9F] mr-2" size={16} />
              <span className="text-sm text-[#2C3E50]">Profile updated - John Doe</span>
            </div>
            <span className="text-xs text-[#4C9F9F]">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#E3F2FD] rounded-lg">
            <div className="flex items-center">
              <FileCheck className="text-[#4C9F9F] mr-2" size={16} />
              <span className="text-sm text-[#2C3E50]">New employee added - Jane Smith</span>
            </div>
            <span className="text-xs text-[#4C9F9F]">5 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayrollOverview() {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <DollarSign className="text-[#4C9F9F] mr-2" size={24} />
          <h3 className="text-lg font-semibold text-[#2C3E50]">Payroll Overview</h3>
        </div>
        <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
          <Filter size={20} />
        </button>
      </div>

      {/* Payroll Cycle Status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#FFF3E0] p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">Pending</div>
          <div className="text-xl font-semibold text-[#FFB400]">3</div>
        </div>
        <div className="bg-[#E3F2FD] p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">In Progress</div>
          <div className="text-xl font-semibold text-[#4C9F9F]">1</div>
        </div>
        <div className="bg-[#E8F5E9] p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">Complete</div>
          <div className="text-xl font-semibold text-[#4C9F9F]">12</div>
        </div>
      </div>

      {/* Salary Disbursement Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">Total Salary</div>
          <div className="text-xl font-semibold text-[#4C9F9F]">$250,000</div>
          <div className="text-xs text-[#4C9F9F] mt-1">This month</div>
        </div>
        <div className="bg-white border border-gray-200 p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">Tax Withheld</div>
          <div className="text-xl font-semibold text-[#4C9F9F]">$50,000</div>
          <div className="text-xs text-[#4C9F9F] mt-1">This month</div>
        </div>
        <div className="bg-white border border-gray-200 p-3 rounded-lg">
          <div className="text-sm text-[#2C3E50]">Upcoming Bonuses</div>
          <div className="text-xl font-semibold text-[#4C9F9F]">$25,000</div>
          <div className="text-xs text-[#4C9F9F] mt-1">Next month</div>
        </div>
      </div>

      {/* Recent Payslips */}
      <div>
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Recent Payslips</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-[#E3F2FD] rounded-lg">
            <div className="flex items-center">
              <FileText className="text-[#4C9F9F] mr-2" size={16} />
              <div>
                <div className="text-sm text-[#2C3E50]">March 2024</div>
                <div className="text-xs text-[#4C9F9F]">John Doe</div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-[#2C3E50] mr-4">$5,000</span>
              <span className="px-2 py-1 text-xs font-medium text-[#4C9F9F] bg-[#E8F5E9] rounded-full">
                Delivered
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#E3F2FD] rounded-lg">
            <div className="flex items-center">
              <FileText className="text-[#4C9F9F] mr-2" size={16} />
              <div>
                <div className="text-sm text-[#2C3E50]">March 2024</div>
                <div className="text-xs text-[#4C9F9F]">Jane Smith</div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-[#2C3E50] mr-4">$4,500</span>
              <span className="px-2 py-1 text-xs font-medium text-[#FFB400] bg-[#FFF3E0] rounded-full">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceAndPolicies() {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="text-[#4C9F9F] mr-2" size={24} />
          <h3 className="text-lg font-semibold text-[#2C3E50]">Compliance & Policies</h3>
        </div>
        <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
          <Filter size={20} />
        </button>
      </div>

      {/* Compliance Alerts */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Compliance Alerts</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-[#FFEBEE] rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="text-[#FF5A5A] mr-2" size={20} />
              <div>
                <div className="text-sm font-medium text-[#2C3E50]">Annual Audit Due</div>
                <div className="text-xs text-[#4C9F9F]">Due in 15 days</div>
              </div>
            </div>
            <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#FFF3E0] rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-[#FFB400] mr-2" size={20} />
              <div>
                <div className="text-sm font-medium text-[#2C3E50]">Policy Updates Pending</div>
                <div className="text-xs text-[#4C9F9F]">5 employees need to acknowledge</div>
              </div>
            </div>
            <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Company Policies */}
      <div>
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Company Policies</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-[#E3F2FD] rounded-lg">
            <div>
              <div className="text-sm font-medium text-[#2C3E50]">Remote Work Policy</div>
              <div className="text-xs text-[#4C9F9F]">Version 2.1</div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-[#4C9F9F] mr-4">85% Acknowledged</span>
              <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
                <Eye size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#E3F2FD] rounded-lg">
            <div>
              <div className="text-sm font-medium text-[#2C3E50]">Code of Conduct</div>
              <div className="text-xs text-[#4C9F9F]">Version 1.5</div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-[#4C9F9F] mr-4">92% Acknowledged</span>
              <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
                <Eye size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RemoteWorkAnalytics() {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="text-[#4C9F9F] mr-2" size={24} />
          <h3 className="text-lg font-semibold text-[#2C3E50]">Remote Work Analytics</h3>
        </div>
        <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
          <Filter size={20} />
        </button>
      </div>

      {/* Weekly Work Hours Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Weekly Work Hours</h4>
        <div className="h-48 flex items-end space-x-2">
          {[40, 35, 42, 38, 45, 32, 37].map((hours, index) => (
            <div key={index} className="flex-1 bg-[#E3F2FD] rounded-t-lg" style={{ height: `${(hours / 45) * 100}%` }}>
              <div className="text-center text-xs text-[#2C3E50] mt-1">Day {index + 1}</div>
              <div className="text-center text-sm font-medium text-[#4C9F9F]">{hours}h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Usage Heatmap */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Tool Usage Heatmap</h4>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <div 
              key={index}
              className="aspect-square rounded-sm"
              style={{ 
                backgroundColor: `rgba(76, 159, 159, ${Math.random() * 0.5 + 0.1})`
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#4C9F9F] mt-2">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Underperforming Users */}
      <div>
        <h4 className="text-sm font-medium text-[#2C3E50] mb-3">Underperforming Users</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-[#FFEBEE] rounded-lg">
            <div className="flex items-center">
              <UserX className="text-[#FF5A5A] mr-2" size={16} />
              <div>
                <div className="text-sm font-medium text-[#2C3E50]">John Doe</div>
                <div className="text-xs text-[#4C9F9F]">Productivity: 65%</div>
              </div>
            </div>
            <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
              <Eye size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#FFEBEE] rounded-lg">
            <div className="flex items-center">
              <UserX className="text-[#FF5A5A] mr-2" size={16} />
              <div>
                <div className="text-sm font-medium text-[#2C3E50]">Jane Smith</div>
                <div className="text-xs text-[#4C9F9F]">Productivity: 70%</div>
              </div>
            </div>
            <button className="text-[#4C9F9F] hover:text-[#2A6F6F]">
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Mobile Menu Button */}
      <button 
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#4C9F9F] text-white p-2 rounded-md"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Responsive Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
            <h1 className="text-xl lg:text-2xl font-bold text-[#4C9F9F]">
              Nexify<span className="text-white">-HR</span>
            </h1>
            <button 
              className="lg:hidden text-white hover:text-gray-300"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 lg:px-4">
            <div className="space-y-1">
              <SidebarItem 
                icon={<Activity size={20} />} 
                text="Dashboard Overview" 
                active={activeSection === 'overview'} 
                onClick={() => {
                  setActiveSection('overview');
                  setIsSidebarOpen(false);
                }}
              />
              <SidebarItem 
                icon={<Users size={20} />} 
                text="User Roles" 
                active={activeSection === 'users'} 
                onClick={() => {
                  setActiveSection('users');
                  setIsSidebarOpen(false);
                  window.location.href = '/user-roles';
                }}
              />

              <SidebarItem 
                icon={<Clock size={20} />} 
                text="HR Approvals" 
                active={activeSection === 'hr-approval'} 
                onClick={() => {
                  setActiveSection('hr-approval');
                  setIsSidebarOpen(false);
                  window.location.href = '/admin/hr-approvals';
                }}
              />

              {/* HR Management Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  HR Management
                </h3>
              </div>
              <SidebarItem 
                icon={<Briefcase size={20} />} 
                text="Job Postings" 
                active={activeSection === 'job-postings'} 
                onClick={() => {
                  setActiveSection('job-postings');
                  setIsSidebarOpen(false);
                  window.location.href = '/hr/job-postings';
                }}
              />
              <SidebarItem 
                icon={<FileText size={20} />} 
                text="Candidate Applications" 
                active={activeSection === 'candidate-applications'} 
                onClick={() => {
                  setActiveSection('candidate-applications');
                  setIsSidebarOpen(false);
                  window.location.href = '/hr/candidate-applications';
                }}
              />
             
              <SidebarItem 
                icon={<Calendar size={20} />} 
                text="Interview Scheduling" 
                active={activeSection === 'interview-scheduling'} 
                onClick={() => {
                  setActiveSection('interview-scheduling');
                  setIsSidebarOpen(false);
                  window.location.href = '/hr/interview-scheduling';
                }}
              />
              <SidebarItem 
                icon={<MessageSquare size={20} />} 
                text="Interview Feedback" 
                active={activeSection === 'interview-feedback'} 
                onClick={() => {
                  setActiveSection('interview-feedback');
                  setIsSidebarOpen(false);
                  window.location.href = '/hr/interview-feedback';
                }}
              />
              <SidebarItem 
                icon={<FileText size={20} />} 
                text="Offer Letters" 
                active={activeSection === 'offer-letters'} 
                onClick={() => {
                  setActiveSection('offer-letters');
                  setIsSidebarOpen(false);
                  window.location.href = '/hr/offer-letters';
                }}
              />

              {/* Employee Management Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Employee Management
                </h3>
              </div>
              <SidebarItem 
                icon={<Database size={20} />} 
                text="Employee Database" 
                active={activeSection === 'employee-database'} 
                onClick={() => {
                  setActiveSection('employee-database');
                  setIsSidebarOpen(false);
                  window.location.href = '/employee/database';
                }}
              />
              <SidebarItem 
                icon={<UserPlus size={20} />} 
                text="New Employee Profile" 
                active={activeSection === 'new-profile'} 
                onClick={() => {
                  setActiveSection('new-profile');
                  setIsSidebarOpen(false);
                  window.location.href = '/employee/new-profile';
                }}
              />
              <SidebarItem 
                icon={<User size={20} />} 
                text="Profile Management" 
                active={activeSection === 'profile-management'} 
                onClick={() => {
                  setActiveSection('profile-management');
                  setIsSidebarOpen(false);
                  window.location.href = '/employee/profile-management';
                }}
              />
              <SidebarItem 
                icon={<Users size={20} />} 
                text="Employee Classification" 
                active={activeSection === 'classification'} 
                onClick={() => {
                  setActiveSection('classification');
                  setIsSidebarOpen(false);
                  window.location.href = '/employee/classification';
                }}
              />

              {/* Payroll Management Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Payroll Management
                </h3>
              </div>
              <SidebarItem 
                icon={<DollarSign size={20} />} 
                text="Payroll Tax" 
                active={activeSection === 'payroll-tax'} 
                onClick={() => {
                  setActiveSection('payroll-tax');
                  setIsSidebarOpen(false);
                  window.location.href = '/employee/payroll-tax';
                }}
              />
              <SidebarItem 
                icon={<Calculator size={20} />} 
                text="Salary Calculation" 
                active={activeSection === 'salary-calculation'} 
                onClick={() => {
                  setActiveSection('salary-calculation');
                  setIsSidebarOpen(false);
                  window.location.href = '/payroll/salary-calculation';
                }}
              />
              <SidebarItem 
                icon={<FileText size={20} />} 
                text="Payslip Generation" 
                active={activeSection === 'payslip-generation'} 
                onClick={() => {
                  setActiveSection('payslip-generation');
                  setIsSidebarOpen(false);
                  window.location.href = '/payroll/payslip-generation';
                }}
              />

              {/* Performance & Analytics Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Performance & Analytics
                </h3>
              </div>
              <SidebarItem 
                icon={<Target size={20} />} 
                text="Goal Setting" 
                active={activeSection === 'goal-setting'} 
                onClick={() => {
                  setActiveSection('goal-setting');
                  setIsSidebarOpen(false);
                  window.location.href = '/performance/goal-setting';
                }}
              />

              {/* Remote Work Section */}
              <div className="pt-4 pb-2">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Remote Work
                </h3>
              </div>
              <SidebarItem 
                icon={<Activity size={20} />} 
                text="Wellness & Fitness" 
                active={activeSection === 'wellness-fitness'} 
                onClick={() => {
                  setActiveSection('wellness-fitness');
                  setIsSidebarOpen(false);
                  window.location.href = '/remote-work/wellness-fitness';
                }}
              />
              <SidebarItem 
                icon={<Clock size={20} />} 
                text="Hours Tracker" 
                active={activeSection === 'hours-tracker'} 
                onClick={() => {
                  setActiveSection('hours-tracker');
                  setIsSidebarOpen(false);
                  window.location.href = '/remote-work/hours-tracker';
                }}
              />
           

              {/* System Settings */}
              <div className="pt-4 pb-2">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  System
                </h3>
              </div>
              <SidebarItem 
                icon={<Settings size={20} />} 
                text="System Settings" 
                active={activeSection === 'settings'} 
                onClick={() => {
                  setActiveSection('settings');
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-4 lg:p-6 border-t border-gray-700">
            <button 
              className="flex items-center justify-start w-full bg-[#4C9F9F] hover:bg-[#2A6F6F] text-white py-2 px-4 rounded-md transition-colors duration-200"
              onClick={() => {
                // Handle logout
                setIsSidebarOpen(false);
              }}
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="text-sm lg:text-base">Logout</span>
            </button>
          </div>
        </div>
      </MobileSidebar>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#A5D8D0] to-[#2C3E50] shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:max-w-2xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-md leading-5 bg-white/10 placeholder-white/70 focus:outline-none focus:placeholder-white focus:ring-1 focus:ring-white focus:border-white sm:text-sm text-white"
                  aria-label="Search users"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                className="relative text-white hover:text-white/80 transition-colors duration-200"
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 h-2 w-2 bg-[#FF5A5A] rounded-full" aria-hidden="true"></span>
              </button>
              <button 
                className="text-white hover:text-white/80 transition-colors duration-200"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-4 lg:p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <StatCard 
              title="Total Users" 
              value="90" 
              icon={<Users size={24} />} 
              color="bg-[#f0f9ff] text-[#1e3a8a]"
              trend={5}
            />
            <StatCard 
              title="New Registrations" 
              value="12" 
              icon={<User size={24} />} 
              color="bg-[#d1fae5] text-[#10b981]"
              trend={8}
            />
            <StatCard 
              title="Pending Approvals" 
              value="5" 
              icon={<AlertCircle size={24} />} 
              color="bg-[#fef3c7] text-[#f59e0b]"
              trend={-2}
            />
            <StatCard 
              title="System Errors" 
              value="0" 
              icon={<AlertCircle size={24} />} 
              color="bg-[#fef2f2] text-[#f87171]"
              trend={-100}
            />
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <UserTable />
              <HRApprovalList />
              <RecruitmentOverview />
              <EmployeeRecords />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <SecurityStatusCard />
                <AWSStatusCard />
              </div>
              <PayrollOverview />
              <ComplianceAndPolicies />
              <RemoteWorkAnalytics />
            </div>
          </div>
        </div>
      </main>

      {/* Role Edit Modal */}
      {showRoleModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-modal-title"
        >
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 id="role-modal-title" className="text-lg font-semibold mb-4 text-[#2C3E50]">Edit User Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  User
                </label>
                <div className="text-sm text-[#2C3E50]">{selectedUser?.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                  Current Role
                </label>
                <div className="text-sm text-[#2C3E50]">{selectedUser?.role}</div>
              </div>
              <div>
                <label htmlFor="new-role" className="block text-sm font-medium text-[#2C3E50] mb-1">
                  New Role
                </label>
                <select 
                  id="new-role"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#4C9F9F] focus:border-[#4C9F9F] sm:text-sm rounded-md"
                >
                  <option>Admin</option>
                  <option>HR</option>
                  <option>Employee</option>
                  <option>Applicant</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#2C3E50] bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4C9F9F] hover:bg-[#2A6F6F] rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;