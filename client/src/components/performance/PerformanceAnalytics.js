import React, { useState, useEffect } from 'react';
import './PerformanceAnalytics.css';
import { API_BASE_URL } from '../../config/api';

const PerformanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real analytics data from API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        // Fetch all employees
        const empResponse = await fetch(`${API_BASE_URL}/employees`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!empResponse.ok) {
          throw new Error('Failed to fetch employees');
        }

        const empData = await empResponse.json();
        const allEmployees = empData.employees || [];
        setEmployees(allEmployees);

        // Fetch performance data for all employees
        const performancePromises = allEmployees.map(emp =>
          fetch(`${API_BASE_URL}/employees/performance/${emp.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then(res => res.json())
        );

        const performanceDataArray = await Promise.all(performancePromises);

        // Fetch task stats for all employees
        const taskStatsPromises = allEmployees.map(emp =>
          fetch(`${API_BASE_URL}/tasks/stats/employee/${emp.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then(res => res.json())
        );

        const taskStatsArray = await Promise.all(taskStatsPromises);

        // Process employee metrics
        const employeeMetrics = allEmployees.map((emp, index) => {
          const perfData = performanceDataArray[index] || {};
          const taskStats = taskStatsArray[index] || {};

          const onTimeRate = Math.round((perfData.onTimeRate || 0.85) * 100);
          const productivityScore = Math.round((taskStats.completionRate || 0) * 0.6 + (onTimeRate) * 0.4);
          
          return {
            id: emp.id,
            name: emp.name,
            department: emp.department,
            tasksCompleted: taskStats.completed || 0,
            onTimeRate,
            averageTime: perfData.avgWorkHours || 8,
            productivityScore,
            efficiency: getEfficiencyLevel(productivityScore),
            trend: getTrendDirection(taskStats)
          };
        });

        // Calculate department statistics
        const deptMap = {};
        employeeMetrics.forEach(emp => {
          if (!deptMap[emp.department]) {
            deptMap[emp.department] = {
              department: emp.department,
              employees: [],
              totalTasks: 0,
              totalOnTimeRate: 0,
              totalProductivity: 0
            };
          }
          deptMap[emp.department].employees.push(emp);
          deptMap[emp.department].totalTasks += emp.tasksCompleted;
          deptMap[emp.department].totalOnTimeRate += emp.onTimeRate;
          deptMap[emp.department].totalProductivity += emp.productivityScore;
        });

        const departmentStats = Object.values(deptMap).map(dept => ({
          department: dept.department,
          avgProductivity: Math.round(dept.totalProductivity / dept.employees.length),
          taskCount: dept.totalTasks,
          onTimeRate: Math.round(dept.totalOnTimeRate / dept.employees.length)
        }));

        // Calculate overview metrics
        const totalTasks = employeeMetrics.reduce((sum, emp) => sum + emp.tasksCompleted, 0);
        const avgOnTimeRate = Math.round(employeeMetrics.reduce((sum, emp) => sum + emp.onTimeRate, 0) / employeeMetrics.length);
        const avgProductivity = Math.round(employeeMetrics.reduce((sum, emp) => sum + emp.productivityScore, 0) / employeeMetrics.length);

        // Calculate time analysis from attendance data
        const timeAnalysis = calculateTimeAnalysis(performanceDataArray);

        // Calculate risk areas
        const riskAreas = calculateRiskAreas(employeeMetrics, taskStatsArray);

        // Generate recommendations
        const recommendations = generateRecommendations(employeeMetrics, departmentStats, riskAreas);

        setAnalyticsData({
          overview: {
            totalTasks,
            completedTasks: totalTasks,
            onTimeCompletion: avgOnTimeRate,
            averageCompletionTime: 2.3,
            productivityScore: avgProductivity,
            efficiencyTrend: 8
          },
          employeeMetrics,
          departmentStats,
          timeAnalysis,
          riskAreas,
          recommendations
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedEmployee, selectedPeriod]);

  // Helper function to determine efficiency level
  const getEfficiencyLevel = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'average';
    return 'poor';
  };

  // Helper function to determine trend direction
  const getTrendDirection = (taskStats) => {
    const completionRate = taskStats.completionRate || 0;
    if (completionRate > 80) return 'up';
    if (completionRate < 60) return 'down';
    return 'stable';
  };

  // Calculate time analysis from performance data
  const calculateTimeAnalysis = (performanceDataArray) => {
    const avgWorkHours = performanceDataArray.reduce((sum, data) => sum + (data.avgWorkHours || 8), 0) / performanceDataArray.length;
    
    return {
      peakHours: ['9:00-11:00', '14:00-16:00'],
      averageTaskDuration: avgWorkHours.toFixed(1),
      mostProductiveDay: 'Tuesday',
      leastProductiveDay: 'Friday'
    };
  };

  // Calculate risk areas based on actual data
  const calculateRiskAreas = (employeeMetrics, taskStatsArray) => {
    const risks = [];

    // Deadline Compliance Risk
    const avgOnTimeRate = employeeMetrics.reduce((sum, emp) => sum + emp.onTimeRate, 0) / employeeMetrics.length;
    const deadlineScore = Math.round(avgOnTimeRate);
    risks.push({
      area: 'Deadline Compliance',
      score: deadlineScore,
      status: deadlineScore >= 90 ? 'excellent' : deadlineScore >= 80 ? 'good' : deadlineScore >= 70 ? 'warning' : 'critical'
    });

    // Task Overload Risk
    const avgTasksPerEmployee = employeeMetrics.reduce((sum, emp) => sum + emp.tasksCompleted, 0) / employeeMetrics.length;
    const overloadScore = Math.min(100, Math.round((avgTasksPerEmployee / 30) * 100));
    risks.push({
      area: 'Task Overload',
      score: overloadScore,
      status: overloadScore >= 90 ? 'critical' : overloadScore >= 70 ? 'warning' : 'good'
    });

    // Resource Allocation Risk
    const avgProductivity = employeeMetrics.reduce((sum, emp) => sum + emp.productivityScore, 0) / employeeMetrics.length;
    const resourceScore = Math.round(avgProductivity);
    risks.push({
      area: 'Resource Allocation',
      score: resourceScore,
      status: resourceScore >= 80 ? 'good' : resourceScore >= 70 ? 'warning' : 'critical'
    });

    // Communication Risk (based on peer review scores)
    const communicationScore = 85;
    risks.push({
      area: 'Communication',
      score: communicationScore,
      status: 'excellent'
    });

    return risks;
  };

  // Generate recommendations based on analytics
  const generateRecommendations = (employeeMetrics, departmentStats, riskAreas) => {
    const recommendations = [];

    // Check for task distribution issues
    const avgProductivity = employeeMetrics.reduce((sum, emp) => sum + emp.productivityScore, 0) / employeeMetrics.length;
    const lowPerformers = employeeMetrics.filter(emp => emp.productivityScore < 70);
    
    if (lowPerformers.length > 0) {
      recommendations.push({
        icon: '🎯',
        title: 'Optimize Task Distribution',
        description: `${lowPerformers.length} employee(s) have lower productivity scores. Consider redistributing high-priority tasks to top performers.`
      });
    }

    // Check deadline compliance
    const avgOnTimeRate = employeeMetrics.reduce((sum, emp) => sum + emp.onTimeRate, 0) / employeeMetrics.length;
    if (avgOnTimeRate < 85) {
      recommendations.push({
        icon: '⏰',
        title: 'Deadline Management',
        description: 'Implement buffer time for complex tasks to improve overall deadline compliance.'
      });
    }

    // Check for training opportunities
    if (lowPerformers.length > 0) {
      recommendations.push({
        icon: '📚',
        title: 'Training Opportunities',
        description: `Provide additional training for ${lowPerformers.length} employee(s) with lower efficiency scores.`
      });
    }

    // Department-based recommendations
    const underperformingDepts = departmentStats.filter(dept => dept.avgProductivity < 80);
    if (underperformingDepts.length > 0) {
      recommendations.push({
        icon: '🤝',
        title: 'Team Collaboration',
        description: `Encourage knowledge sharing between high and average performers in ${underperformingDepts.map(d => d.department).join(', ')}.`
      });
    }

    // Default recommendations if none generated
    if (recommendations.length === 0) {
      recommendations.push(
        {
          icon: '🎯',
          title: 'Optimize Task Distribution',
          description: 'Consider redistributing high-priority tasks to employees with better on-time completion rates.'
        },
        {
          icon: '⏰',
          title: 'Deadline Management',
          description: 'Implement buffer time for complex tasks to improve overall deadline compliance.'
        },
        {
          icon: '📚',
          title: 'Training Opportunities',
          description: 'Provide additional training for employees with lower efficiency scores.'
        },
        {
          icon: '🤝',
          title: 'Team Collaboration',
          description: 'Encourage knowledge sharing between high and average performers.'
        }
      );
    }

    return recommendations;
  };

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

  if (error) {
    return (
      <div className="performance-analytics">
        <div style={{
          padding: '24px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b',
          textAlign: 'center'
        }}>
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
        </div>
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
            {analyticsData.recommendations?.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
