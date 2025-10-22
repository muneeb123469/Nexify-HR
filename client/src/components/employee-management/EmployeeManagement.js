import React, { useState } from 'react';
import { Sidebar } from '../dashboard/HRDashboard';
import EmployeeDatabaseManagement from './EmployeeDatabaseManagement';
import EmployeeClassification from './EmployeeClassification';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState('database');

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
