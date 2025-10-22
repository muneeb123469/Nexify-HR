import React, { useState, useEffect } from 'react';
import './PerformanceAnalytics.css';

const PerformanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock analytics data - will be replaced with API calls
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        overview: {
          totalTasks: 156,
          completedTasks: 124,
          onTimeCompletion: 89,
          averageCompletionTime: 2.3,
          productivityScore: 87,
          efficiencyTrend: 12
        },
        employeeMetrics: [
          {
            id: 1,
            name: 'John Doe',
            department: 'Engineering',
            tasksCompleted: 28,
            onTimeRate: 92,
            averageTime: 2.1,
            productivityScore: 94,
            efficiency: 'excellent',
            trend: 'up'
          },
          {
            id: 2,
            name: 'Jane Smith',
            department: 'Marketing',
            tasksCompleted: 24,
            onTimeRate: 87,
            averageTime: 2.4,
            productivityScore: 89,
            efficiency: 'good',
            trend: 'up'
          },
          {
            id: 3,
            name: 'Mike Johnson',
            department: 'Sales',
            tasksCompleted: 18,
            onTimeRate: 72,
            averageTime: 3.2,
            productivityScore: 76,
            efficiency: 'average',
            trend: 'down'
          },
          {
            id: 4,
            name: 'Sarah Wilson',
            department: 'HR',
            tasksCompleted: 22,
            onTimeRate: 95,
            averageTime: 1.8,
            productivityScore: 91,
            efficiency: 'excellent',
            trend: 'stable'
          }
        ],
        departmentStats: [
          { department: 'Engineering', avgProductivity: 91, taskCount: 45, onTimeRate: 88 },
          { department: 'Marketing', avgProductivity: 85, taskCount: 38, onTimeRate: 82 },
          { department: 'Sales', avgProductivity: 79, taskCount: 32, onTimeRate: 75 },
          { department: 'HR', avgProductivity: 88, taskCount: 28, onTimeRate: 90 }
        ],
        timeAnalysis: {
          peakHours: ['9:00-11:00', '14:00-16:00'],
          averageTaskDuration: 2.3,
          mostProductiveDay: 'Tuesday',
          leastProductiveDay: 'Friday'
        },
        riskAreas: [
          { area: 'Deadline Compliance', score: 72, status: 'warning' },
          { area: 'Task Overload', score: 68, status: 'critical' },
          { area: 'Resource Allocation', score: 85, status: 'good' },
          { area: 'Communication', score: 91, status: 'excellent' }
        ]
      });

      setEmployees([
        { id: 1, name: 'John Doe', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', department: 'Marketing' },
        { id: 3, name: 'Mike Johnson', department: 'Sales' },
        { id: 4, name: 'Sarah Wilson', department: 'HR' }
      ]);

      setLoading(false);
    }, 1000);
  }, [selectedEmployee, selectedPeriod]);

  const getEfficiencyColor = (efficiency) => {
    switch (efficiency) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'average': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getRiskColor = (status) => {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="performance-analytics">
      {/* Controls */}
      <div className="analytics-controls">
        <div className="control-group">
          <label>Employee:</label>
          <select 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Time Period:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="overview-metrics">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-info">
            <div className="metric-value">{analyticsData.overview?.totalTasks}</div>
            <div className="metric-label">Total Tasks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-info">
            <div className="metric-value">{analyticsData.overview?.completedTasks}</div>
            <div className="metric-label">Completed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-info">
            <div className="metric-value">{analyticsData.overview?.onTimeCompletion}%</div>
            <div className="metric-label">On-Time Rate</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-info">
            <div className="metric-value">{analyticsData.overview?.productivityScore}</div>
            <div className="metric-label">Productivity Score</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-info">
            <div className="metric-value">+{analyticsData.overview?.efficiencyTrend}%</div>
            <div className="metric-label">Efficiency Trend</div>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Employee Performance Table */}
        <div className="analytics-section">
          <div className="section-header">
            <h3>👥 Employee Performance</h3>
            <p>Individual performance metrics and rankings</p>
          </div>

          <div className="performance-table">
            <div className="table-header">
              <div>Employee</div>
              <div>Tasks</div>
              <div>On-Time Rate</div>
              <div>Avg. Time</div>
              <div>Score</div>
              <div>Efficiency</div>
              <div>Trend</div>
            </div>

            {analyticsData.employeeMetrics?.map(employee => (
              <div key={employee.id} className="table-row">
                <div className="employee-info">
                  <div className="employee-name">{employee.name}</div>
                  <div className="employee-dept">{employee.department}</div>
                </div>
                <div className="task-count">{employee.tasksCompleted}</div>
                <div className="on-time-rate">
                  <div className="rate-bar">
                    <div 
                      className="rate-fill"
                      style={{ 
                        width: `${employee.onTimeRate}%`,
                        backgroundColor: employee.onTimeRate >= 90 ? '#10b981' : 
                                       employee.onTimeRate >= 80 ? '#3b82f6' : 
                                       employee.onTimeRate >= 70 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <span>{employee.onTimeRate}%</span>
                </div>
                <div className="avg-time">{employee.averageTime}d</div>
                <div className="productivity-score">
                  <div className="score-circle">
                    <span>{employee.productivityScore}</span>
                  </div>
                </div>
                <div className="efficiency-badge">
                  <span 
                    className="efficiency-tag"
                    style={{ backgroundColor: getEfficiencyColor(employee.efficiency) }}
                  >
                    {employee.efficiency}
                  </span>
                </div>
                <div className="trend-indicator">
                  {getTrendIcon(employee.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Statistics */}
        <div className="analytics-section">
          <div className="section-header">
            <h3>🏢 Department Analysis</h3>
            <p>Performance breakdown by department</p>
          </div>

          <div className="department-stats">
            {analyticsData.departmentStats?.map((dept, index) => (
              <div key={index} className="dept-card">
                <div className="dept-header">
                  <h4>{dept.department}</h4>
                  <div className="dept-score">{dept.avgProductivity}</div>
                </div>
                <div className="dept-metrics">
                  <div className="dept-metric">
                    <span className="metric-label">Tasks:</span>
                    <span className="metric-value">{dept.taskCount}</span>
                  </div>
                  <div className="dept-metric">
                    <span className="metric-label">On-Time:</span>
                    <span className="metric-value">{dept.onTimeRate}%</span>
                  </div>
                </div>
                <div className="dept-progress">
                  <div 
                    className="dept-progress-bar"
                    style={{ 
                      width: `${dept.avgProductivity}%`,
                      backgroundColor: dept.avgProductivity >= 90 ? '#10b981' : 
                                     dept.avgProductivity >= 80 ? '#3b82f6' : 
                                     dept.avgProductivity >= 70 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Analysis */}
        <div className="analytics-section">
          <div className="section-header">
            <h3>⏱️ Time Analysis</h3>
            <p>Productivity patterns and time insights</p>
          </div>

          <div className="time-analysis">
            <div className="time-insight">
              <div className="insight-icon">🕘</div>
              <div className="insight-info">
                <h4>Peak Hours</h4>
                <p>{analyticsData.timeAnalysis?.peakHours?.join(', ')}</p>
              </div>
            </div>

            <div className="time-insight">
              <div className="insight-icon">⏳</div>
              <div className="insight-info">
                <h4>Avg. Task Duration</h4>
                <p>{analyticsData.timeAnalysis?.averageTaskDuration} days</p>
              </div>
            </div>

            <div className="time-insight">
              <div className="insight-icon">📅</div>
              <div className="insight-info">
                <h4>Most Productive</h4>
                <p>{analyticsData.timeAnalysis?.mostProductiveDay}</p>
              </div>
            </div>

            <div className="time-insight">
              <div className="insight-icon">📉</div>
              <div className="insight-info">
                <h4>Least Productive</h4>
                <p>{analyticsData.timeAnalysis?.leastProductiveDay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Areas */}
        <div className="analytics-section">
          <div className="section-header">
            <h3>⚠️ Risk Assessment</h3>
            <p>Areas requiring attention and improvement</p>
          </div>

          <div className="risk-areas">
            {analyticsData.riskAreas?.map((risk, index) => (
              <div key={index} className="risk-card">
                <div className="risk-header">
                  <h4>{risk.area}</h4>
                  <div 
                    className="risk-status"
                    style={{ backgroundColor: getRiskColor(risk.status) }}
                  >
                    {risk.status}
                  </div>
                </div>
                <div className="risk-score">
                  <div className="score-label">Risk Score</div>
                  <div className="score-value">{risk.score}/100</div>
                </div>
                <div className="risk-progress">
                  <div 
                    className="risk-progress-bar"
                    style={{ 
                      width: `${risk.score}%`,
                      backgroundColor: getRiskColor(risk.status)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="analytics-section chart-section">
          <div className="section-header">
            <h3>📊 Performance Trends</h3>
            <p>Visual representation of performance over time</p>
          </div>

          <div className="chart-placeholder">
            <div className="chart-icon">📈</div>
            <h4>Performance Chart</h4>
            <p>Interactive charts showing productivity trends, task completion rates, and efficiency metrics over time.</p>
            <div className="chart-features">
              <span>• Task completion trends</span>
              <span>• Productivity scores</span>
              <span>• Department comparisons</span>
              <span>• Individual performance</span>
            </div>
          </div>
        </div>

        {/* Efficiency Recommendations */}
        <div className="analytics-section">
          <div className="section-header">
            <h3>💡 Recommendations</h3>
            <p>AI-powered suggestions for improvement</p>
          </div>

          <div className="recommendations">
            <div className="recommendation-item">
              <div className="rec-icon">🎯</div>
              <div className="rec-content">
                <h4>Optimize Task Distribution</h4>
                <p>Consider redistributing high-priority tasks to employees with better on-time completion rates.</p>
              </div>
            </div>

            <div className="recommendation-item">
              <div className="rec-icon">⏰</div>
              <div className="rec-content">
                <h4>Deadline Management</h4>
                <p>Implement buffer time for complex tasks to improve overall deadline compliance.</p>
              </div>
            </div>

            <div className="recommendation-item">
              <div className="rec-icon">📚</div>
              <div className="rec-content">
                <h4>Training Opportunities</h4>
                <p>Provide additional training for employees with lower efficiency scores.</p>
              </div>
            </div>

            <div className="recommendation-item">
              <div className="rec-icon">🤝</div>
              <div className="rec-content">
                <h4>Team Collaboration</h4>
                <p>Encourage knowledge sharing between high and average performers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
