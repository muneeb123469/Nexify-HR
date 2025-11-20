import React, { useState } from 'react';
import { Sidebar } from '../dashboard/HRDashboard';
import EmployeeDatabaseManagement from './EmployeeDatabaseManagement';
import EmployeeClassification from './EmployeeClassification';
import EmployeePerformanceOverview from './EmployeePerformanceOverview';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState('performance');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <Sidebar />
      <div className="employee-management">
        <div className="management-header">
          <h1>Employee Management</h1>
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => handleTabChange('performance')}
            >
              <i className="fas fa-chart-line"></i>
              Performance Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => handleTabChange('database')}
            >
              <i className="fas fa-database"></i>
              Database
            </button>
            <button
              className={`tab-button ${activeTab === 'classification' ? 'active' : ''}`}
              onClick={() => handleTabChange('classification')}
            >
              <i className="fas fa-users-cog"></i>
              Classification
            </button>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'performance' && (
            <div className="tab-panel">
              <EmployeePerformanceOverview />
            </div>
          )}
          {activeTab === 'database' && (
            <div className="tab-panel">
              <EmployeeDatabaseManagement />
            </div>
          )}
          {activeTab === 'classification' && (
            <div className="tab-panel">
              <EmployeeClassification />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeManagement;
