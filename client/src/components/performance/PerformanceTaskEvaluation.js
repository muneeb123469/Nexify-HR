import React, { useState, useEffect } from 'react';
import { Sidebar } from '../dashboard/HRDashboard';
import './PerformanceTaskEvaluation.css';

// Tab Components
import TaskAssignment from './TaskAssignment';
import TaskTracking from './TaskTracking';
import PerformanceAnalytics from './PerformanceAnalytics';
import ReportsInsights from './ReportsInsights';
import BehaviorPrediction from './BehaviorPrediction';

const PerformanceTaskEvaluation = () => {
  const [activeTab, setActiveTab] = useState('assignment');
  const [loading, setLoading] = useState(false);

  const tabs = [
    {
      id: 'assignment',
      label: 'Task Assignment',
      icon: '📋',
      component: TaskAssignment
    },
    {
      id: 'tracking',
      label: 'Task Tracking',
      icon: '📊',
      component: TaskTracking
    },
    {
      id: 'analytics',
      label: 'Performance Analytics',
      icon: '📈',
      component: PerformanceAnalytics
    },
    {
      id: 'reports',
      label: 'Reports & Insights',
      icon: '📑',
      component: ReportsInsights
    },
    {
      id: 'prediction',
      label: 'Behavior Prediction',
      icon: '🔮',
      component: BehaviorPrediction
    }
  ];

  const renderActiveComponent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;
      return <Component />;
    }
    return null;
  };

  return (
    <>
      <Sidebar />
      <div className="performance-task-container">
        <div className="performance-task-header">
          <div className="header-content">
            <h1>Performance & Task Evaluation</h1>
          </div>
        </div>

        <div className="performance-task-content">
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            ) : (
              renderActiveComponent()
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PerformanceTaskEvaluation;
