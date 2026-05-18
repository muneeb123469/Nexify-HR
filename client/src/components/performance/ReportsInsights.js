import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportsInsights.css';
import { API_BASE_URL } from '../../config/api';

const ReportsInsights = () => {
  const [reportData, setReportData] = useState({});
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  // Fetch real report data from API
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        let data = {};

        // Fetch data based on selected report
        if (selectedReport === 'overview') {
          const response = await axios.get(`${API_BASE_URL}/reports/executive-summary`, config);
          data.overview = response.data;
        } else if (selectedReport === 'productivity') {
          const response = await axios.get(`${API_BASE_URL}/reports/productivity-analysis`, config);
          data.productivity = response.data;
        } else if (selectedReport === 'efficiency') {
          const response = await axios.get(`${API_BASE_URL}/reports/efficiency-report`, config);
          data.efficiency = response.data;
        } else if (selectedReport === 'compliance') {
          const response = await axios.get(`${API_BASE_URL}/reports/compliance-report`, config);
          data.compliance = response.data;
        }

        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data:', error);
        // Show error message to user
        alert('Failed to fetch report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedReport, dateRange]);

  const reportTypes = [
    { id: 'overview', label: 'Executive Summary', icon: '📊' },
    { id: 'productivity', label: 'Productivity Analysis', icon: '📈' },
    { id: 'efficiency', label: 'Efficiency Report', icon: '⚡' },
    { id: 'compliance', label: 'Compliance Report', icon: '✅' }
  ];

  const handleExport = async (format) => {
    if (format !== 'pdf') {
      alert(`${format.toUpperCase()} export coming soon!`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Map report types to download endpoints
      const endpointMap = {
        'overview': 'executive-summary',
        'productivity': 'productivity-analysis',
        'efficiency': 'efficiency-report',
        'compliance': 'compliance-report'
      };

      const endpoint = endpointMap[selectedReport];
      if (!endpoint) {
        alert('Invalid report type');
        return;
      }

      // Show loading message
      const downloadBtn = document.querySelector('.export-btn.pdf');
      if (downloadBtn) {
        downloadBtn.textContent = 'Downloading...';
        downloadBtn.disabled = true;
      }

      // Fetch the PDF
      const response = await fetch(`${API_BASE_URL}/reports/download/${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${endpoint}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Reset button
      if (downloadBtn) {
        downloadBtn.textContent = '📄 PDF';
        downloadBtn.disabled = false;
      }

      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
      
      // Reset button on error
      const downloadBtn = document.querySelector('.export-btn.pdf');
      if (downloadBtn) {
        downloadBtn.textContent = '📄 PDF';
        downloadBtn.disabled = false;
      }
    }
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

          {/* Employees at Risk Section */}
          {reportData.overview?.employeesAtRisk && reportData.overview.employeesAtRisk.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4>⚠️ Employees with Tasks Near Due Date</h4>
              <div className="risk-table">
                <div className="risk-header">
                  <span>Employee Name</span>
                  <span>Department</span>
                  <span>Tasks at Risk</span>
                </div>
                {reportData.overview.employeesAtRisk.map((emp, index) => (
                  <div key={index} className="risk-row">
                    <span className="risk-area">{emp.employeeName}</span>
                    <span className="risk-impact">{emp.department}</span>
                    <span className="risk-level" style={{ backgroundColor: '#f59e0b' }}>
                      {emp.tasksAtRisk} task{emp.tasksAtRisk > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                <div className="recommendation-text">
                  {typeof recommendation === 'string' ? recommendation : (
                    <>
                      <strong>{recommendation.title}</strong>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                        {recommendation.description}
                      </p>
                    </>
                  )}
                </div>
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
            <label>Download Report</label>
            <div className="export-buttons">
              <button 
                className="export-btn pdf"
                onClick={() => handleExport('pdf')}
              >
                📄 PDF
              </button>
              {/* <button 
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
              </button> */}
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
        {/* <div className="report-actions">
          <button className="action-btn schedule">
            📅 Schedule Report
          </button>
          <button className="action-btn share">
            📤 Share Report
          </button>
        </div> */}
      </div>

      {/* Report Content */}
      <div className="report-container">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportsInsights;
