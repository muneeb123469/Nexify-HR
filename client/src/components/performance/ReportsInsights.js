import React, { useState, useEffect } from 'react';
import './ReportsInsights.css';

const ReportsInsights = () => {
  const [reportData, setReportData] = useState({});
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  // Mock report data - will be replaced with API calls
  useEffect(() => {
    setLoading(true);
    
    setTimeout(() => {
      setReportData({
        overview: {
          totalEmployees: 24,
          activeTasks: 156,
          completionRate: 87,
          averageProductivity: 84,
          topPerformers: [
            { name: 'Sarah Wilson', score: 94, department: 'HR' },
            { name: 'John Doe', score: 92, department: 'Engineering' },
            { name: 'Jane Smith', score: 89, department: 'Marketing' }
          ],
          lowPerformers: [
            { name: 'Mike Johnson', score: 72, department: 'Sales' },
            { name: 'Alex Brown', score: 68, department: 'Support' },
            { name: 'Lisa Davis', score: 65, department: 'Admin' }
          ],
          riskAreas: [
            { area: 'Deadline Compliance', risk: 'High', impact: 'Critical' },
            { area: 'Task Overload', risk: 'Medium', impact: 'Moderate' },
            { area: 'Resource Allocation', risk: 'Low', impact: 'Minor' }
          ]
        },
        productivity: {
          trends: [
            { period: 'Week 1', score: 82 },
            { period: 'Week 2', score: 85 },
            { period: 'Week 3', score: 87 },
            { period: 'Week 4', score: 84 }
          ],
          departmentComparison: [
            { department: 'Engineering', current: 91, previous: 88, change: 3 },
            { department: 'Marketing', current: 85, previous: 82, change: 3 },
            { department: 'Sales', current: 79, previous: 83, change: -4 },
            { department: 'HR', current: 88, previous: 85, change: 3 }
          ],
          taskCategories: [
            { category: 'Development', completed: 45, pending: 12, overdue: 3 },
            { category: 'Marketing', completed: 38, pending: 8, overdue: 2 },
            { category: 'Sales', completed: 32, pending: 15, overdue: 5 },
            { category: 'Administrative', completed: 28, pending: 6, overdue: 1 }
          ]
        },
        efficiency: {
          timeUtilization: 78,
          resourceEfficiency: 82,
          processOptimization: 75,
          communicationScore: 88,
          bottlenecks: [
            { process: 'Task Assignment', delay: '2.3 days', impact: 'High' },
            { process: 'Review Process', delay: '1.8 days', impact: 'Medium' },
            { process: 'Resource Approval', delay: '3.1 days', impact: 'High' }
          ],
          improvements: [
            { area: 'Automated Workflows', potential: '25%', priority: 'High' },
            { area: 'Better Communication', potential: '18%', priority: 'Medium' },
            { area: 'Resource Planning', potential: '22%', priority: 'High' }
          ]
        },
        compliance: {
          deadlineCompliance: 87,
          qualityStandards: 92,
          processAdherence: 85,
          documentationScore: 79,
          violations: [
            { type: 'Missed Deadline', count: 8, severity: 'Medium' },
            { type: 'Quality Issues', count: 3, severity: 'High' },
            { type: 'Process Deviation', count: 5, severity: 'Low' }
          ],
          recommendations: [
            'Implement automated deadline reminders',
            'Enhance quality control processes',
            'Provide process training to team leads',
            'Improve documentation standards'
          ]
        }
      });
      setLoading(false);
    }, 1000);
  }, [selectedReport, dateRange]);

  const reportTypes = [
    { id: 'overview', label: 'Executive Summary', icon: '📊' },
    { id: 'productivity', label: 'Productivity Analysis', icon: '📈' },
    { id: 'efficiency', label: 'Efficiency Report', icon: '⚡' },
    { id: 'compliance', label: 'Compliance Report', icon: '✅' }
  ];

  const handleExport = (format) => {
    // TODO: Implement export functionality
    alert(`Exporting ${selectedReport} report as ${format.toUpperCase()}...`);
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return '↗️';
    if (change < 0) return '↘️';
    return '➡️';
  };

  const renderOverviewReport = () => (
    <div className="report-content">
      <div className="report-summary">
        <div className="summary-card">
          <h3>📊 Performance Overview</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Employees:</span>
              <span className="stat-value">{reportData.overview?.totalEmployees}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Tasks:</span>
              <span className="stat-value">{reportData.overview?.activeTasks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completion Rate:</span>
              <span className="stat-value">{reportData.overview?.completionRate}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg. Productivity:</span>
              <span className="stat-value">{reportData.overview?.averageProductivity}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-section">
          <h4>🏆 Top Performers</h4>
          <div className="performers-list">
            {reportData.overview?.topPerformers?.map((performer, index) => (
              <div key={index} className="performer-item top-performer">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-name">{performer.name}</div>
                  <div className="performer-dept">{performer.department}</div>
                </div>
                <div className="performer-score">{performer.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>⚠️ Needs Attention</h4>
          <div className="performers-list">
            {reportData.overview?.lowPerformers?.map((performer, index) => (
              <div key={index} className="performer-item low-performer">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-name">{performer.name}</div>
                  <div className="performer-dept">{performer.department}</div>
                </div>
                <div className="performer-score">{performer.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section full-width">
          <h4>🚨 Risk Areas</h4>
          <div className="risk-table">
            <div className="risk-header">
              <span>Area</span>
              <span>Risk Level</span>
              <span>Impact</span>
            </div>
            {reportData.overview?.riskAreas?.map((risk, index) => (
              <div key={index} className="risk-row">
                <span className="risk-area">{risk.area}</span>
                <span 
                  className="risk-level"
                  style={{ backgroundColor: getRiskColor(risk.risk) }}
                >
                  {risk.risk}
                </span>
                <span className="risk-impact">{risk.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductivityReport = () => (
    <div className="report-content">
      <div className="report-grid">
        <div className="report-section">
          <h4>📈 Productivity Trends</h4>
          <div className="trend-chart">
            {reportData.productivity?.trends?.map((trend, index) => (
              <div key={index} className="trend-item">
                <div className="trend-period">{trend.period}</div>
                <div className="trend-bar">
                  <div 
                    className="trend-fill"
                    style={{ 
                      height: `${trend.score}%`,
                      backgroundColor: trend.score >= 85 ? '#10b981' : trend.score >= 75 ? '#3b82f6' : '#f59e0b'
                    }}
                  />
                </div>
                <div className="trend-score">{trend.score}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>🏢 Department Comparison</h4>
          <div className="department-comparison">
            {reportData.productivity?.departmentComparison?.map((dept, index) => (
              <div key={index} className="dept-comparison-item">
                <div className="dept-name">{dept.department}</div>
                <div className="dept-scores">
                  <span className="current-score">{dept.current}%</span>
                  <span className="score-change" style={{ color: getChangeColor(dept.change) }}>
                    {getChangeIcon(dept.change)} {Math.abs(dept.change)}%
                  </span>
                </div>
                <div className="dept-progress">
                  <div 
                    className="dept-progress-bar"
                    style={{ 
                      width: `${dept.current}%`,
                      backgroundColor: dept.current >= 85 ? '#10b981' : dept.current >= 75 ? '#3b82f6' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section full-width">
          <h4>📋 Task Categories Analysis</h4>
          <div className="category-analysis">
            {reportData.productivity?.taskCategories?.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-header">
                  <h5>{category.category}</h5>
                  <div className="category-total">
                    Total: {category.completed + category.pending + category.overdue}
                  </div>
                </div>
                <div className="category-breakdown">
                  <div className="breakdown-item completed">
                    <span className="breakdown-label">Completed:</span>
                    <span className="breakdown-value">{category.completed}</span>
                  </div>
                  <div className="breakdown-item pending">
                    <span className="breakdown-label">Pending:</span>
                    <span className="breakdown-value">{category.pending}</span>
                  </div>
                  <div className="breakdown-item overdue">
                    <span className="breakdown-label">Overdue:</span>
                    <span className="breakdown-value">{category.overdue}</span>
                  </div>
                </div>
                <div className="category-progress">
                  <div 
                    className="progress-segment completed"
                    style={{ 
                      width: `${(category.completed / (category.completed + category.pending + category.overdue)) * 100}%`
                    }}
                  />
                  <div 
                    className="progress-segment pending"
                    style={{ 
                      width: `${(category.pending / (category.completed + category.pending + category.overdue)) * 100}%`
                    }}
                  />
                  <div 
                    className="progress-segment overdue"
                    style={{ 
                      width: `${(category.overdue / (category.completed + category.pending + category.overdue)) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEfficiencyReport = () => (
    <div className="report-content">
      <div className="efficiency-metrics">
        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-info">
            <div className="metric-value">{reportData.efficiency?.timeUtilization}%</div>
            <div className="metric-label">Time Utilization</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-info">
            <div className="metric-value">{reportData.efficiency?.resourceEfficiency}%</div>
            <div className="metric-label">Resource Efficiency</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⚙️</div>
          <div className="metric-info">
            <div className="metric-value">{reportData.efficiency?.processOptimization}%</div>
            <div className="metric-label">Process Optimization</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-info">
            <div className="metric-value">{reportData.efficiency?.communicationScore}%</div>
            <div className="metric-label">Communication</div>
          </div>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-section">
          <h4>🚧 Process Bottlenecks</h4>
          <div className="bottlenecks-list">
            {reportData.efficiency?.bottlenecks?.map((bottleneck, index) => (
              <div key={index} className="bottleneck-item">
                <div className="bottleneck-info">
                  <div className="bottleneck-process">{bottleneck.process}</div>
                  <div className="bottleneck-delay">Avg. Delay: {bottleneck.delay}</div>
                </div>
                <div 
                  className="bottleneck-impact"
                  style={{ 
                    backgroundColor: bottleneck.impact === 'High' ? '#ef4444' : 
                                   bottleneck.impact === 'Medium' ? '#f59e0b' : '#10b981'
                  }}
                >
                  {bottleneck.impact}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>💡 Improvement Opportunities</h4>
          <div className="improvements-list">
            {reportData.efficiency?.improvements?.map((improvement, index) => (
              <div key={index} className="improvement-item">
                <div className="improvement-info">
                  <div className="improvement-area">{improvement.area}</div>
                  <div className="improvement-potential">Potential: +{improvement.potential}</div>
                </div>
                <div 
                  className="improvement-priority"
                  style={{ 
                    backgroundColor: improvement.priority === 'High' ? '#ef4444' : 
                                   improvement.priority === 'Medium' ? '#f59e0b' : '#10b981'
                  }}
                >
                  {improvement.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplianceReport = () => (
    <div className="report-content">
      <div className="compliance-metrics">
        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-info">
            <div className="metric-value">{reportData.compliance?.deadlineCompliance}%</div>
            <div className="metric-label">Deadline Compliance</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⭐</div>
          <div className="metric-info">
            <div className="metric-value">{reportData.compliance?.qualityStandards}%</div>
            <div className="metric-label">Quality Standards</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📋</div>
          <div className="metric-info">
            <div className="metric-value">{reportData.compliance?.processAdherence}%</div>
            <div className="metric-label">Process Adherence</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📄</div>
          <div className="metric-info">
            <div className="metric-value">{reportData.compliance?.documentationScore}%</div>
            <div className="metric-label">Documentation</div>
          </div>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-section">
          <h4>⚠️ Compliance Violations</h4>
          <div className="violations-list">
            {reportData.compliance?.violations?.map((violation, index) => (
              <div key={index} className="violation-item">
                <div className="violation-info">
                  <div className="violation-type">{violation.type}</div>
                  <div className="violation-count">Count: {violation.count}</div>
                </div>
                <div 
                  className="violation-severity"
                  style={{ 
                    backgroundColor: violation.severity === 'High' ? '#ef4444' : 
                                   violation.severity === 'Medium' ? '#f59e0b' : '#10b981'
                  }}
                >
                  {violation.severity}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h4>📝 Recommendations</h4>
          <div className="recommendations-list">
            {reportData.compliance?.recommendations?.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-icon">💡</div>
                <div className="recommendation-text">{recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview': return renderOverviewReport();
      case 'productivity': return renderProductivityReport();
      case 'efficiency': return renderEfficiencyReport();
      case 'compliance': return renderComplianceReport();
      default: return renderOverviewReport();
    }
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Generating report...</p>
      </div>
    );
  }

  return (
    <div className="reports-insights">
      {/* Report Controls */}
      <div className="reports-controls">
        <div className="report-selector">
          <label>Report Type:</label>
          <div className="report-tabs">
            {reportTypes.map(report => (
              <button
                key={report.id}
                className={`report-tab ${selectedReport === report.id ? 'active' : ''}`}
                onClick={() => setSelectedReport(report.id)}
              >
                <span className="tab-icon">{report.icon}</span>
                <span className="tab-label">{report.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="report-options">
          <div className="option-group">
            <label>Period:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="export-options">
            <label>Export:</label>
            <div className="export-buttons">
              <button 
                className="export-btn pdf"
                onClick={() => handleExport('pdf')}
              >
                📄 PDF
              </button>
              <button 
                className="export-btn excel"
                onClick={() => handleExport('excel')}
              >
                📊 Excel
              </button>
              <button 
                className="export-btn csv"
                onClick={() => handleExport('csv')}
              >
                📋 CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Header */}
      <div className="report-header">
        <div className="report-title">
          <h2>
            {reportTypes.find(r => r.id === selectedReport)?.icon} {' '}
            {reportTypes.find(r => r.id === selectedReport)?.label}
          </h2>
          <p>Generated on {new Date().toLocaleDateString()} for {dateRange}</p>
        </div>
        <div className="report-actions">
          <button className="action-btn schedule">
            📅 Schedule Report
          </button>
          <button className="action-btn share">
            📤 Share Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="report-container">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportsInsights;
