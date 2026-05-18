import React, { useState, useEffect } from 'react';
import './PerformanceAnalytics.css';
import { API_BASE_URL } from '../../config/api';

const PerformanceAnalytics = ({ employeeId }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchPerformanceData();
  }, [employeeId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/employees/performance/${employeeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      
      const data = await response.json();
      setPerformanceData(data);
      setEditData({
        workMode: data.workLocation,
        taskQualityScore: data.taskQualityScore,
        peerReviewScore: data.peerReviewScore,
        managerRating: data.managerRating,
        trainingHoursCompleted: data.trainingHoursCompleted,
        promotionsLast3Years: data.promotionsLast3Years,
        disciplinaryActions: data.disciplinaryActions
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Update work mode
      await fetch(`${API_BASE_URL}/employees/${employeeId}/work-mode`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workMode: editData.workMode }),
      });

      // Update performance metrics
      const metricsData = { ...editData };
      delete metricsData.workMode; // Remove workMode as it's handled separately
      
      await fetch(`${API_BASE_URL}/employees/${employeeId}/performance-metrics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricsData),
      });

      setEditMode(false);
      fetchPerformanceData(); // Refresh data
    } catch (err) {
      setError('Failed to update performance data');
      console.error('Error updating performance data:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="loading">Loading performance data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!performanceData) {
    return <div className="no-data">No performance data available</div>;
  }

  return (
    <div className="performance-analytics">
      <div className="performance-header">
        <h3>Performance Analytics</h3>
        <div className="performance-actions">
          {editMode ? (
            <>
              <button onClick={handleSave} className="save-btn">Save</button>
              <button onClick={() => setEditMode(false)} className="cancel-btn">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="edit-btn">Edit</button>
          )}
        </div>
      </div>

      <div className="performance-sections">
        {/* Core Metrics Section */}
        <div className="performance-section">
          <h4>Core Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>Years in Company</label>
              <div className="metric-value">{performanceData.yearsInCompany} years</div>
            </div>
            <div className="metric-item">
              <label>Years in Role</label>
              <div className="metric-value">{performanceData.yearsInRole} years</div>
            </div>
            <div className="metric-item">
              <label>Work Location</label>
              {editMode ? (
                <select 
                  value={editData.workMode} 
                  onChange={(e) => handleInputChange('workMode', e.target.value)}
                  className="edit-input"
                >
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Office">Office</option>
                </select>
              ) : (
                <div className="metric-value">{performanceData.workLocation}</div>
              )}
            </div>
            <div className="metric-item">
              <label>Salary Band</label>
              <div className={`metric-value salary-band ${performanceData.salaryBand.toLowerCase()}`}>
                {performanceData.salaryBand}
              </div>
            </div>
          </div>
        </div>

        {/* Task Performance Section */}
        <div className="performance-section">
          <h4>Task Performance</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>Tasks Assigned</label>
              <div className="metric-value">{performanceData.tasksAssigned}</div>
            </div>
            <div className="metric-item">
              <label>Tasks Completed</label>
              <div className="metric-value">{performanceData.tasksCompleted}</div>
            </div>
            <div className="metric-item">
              <label>Completion Rate</label>
              <div className="metric-value">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${performanceData.taskCompletionRate}%` }}
                  ></div>
                  <span className="progress-text">{performanceData.taskCompletionRate}%</span>
                </div>
              </div>
            </div>
            <div className="metric-item">
              <label>Task Quality Score</label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editData.taskQualityScore}
                  onChange={(e) => handleInputChange('taskQualityScore', parseFloat(e.target.value))}
                  className="edit-input"
                />
              ) : (
                <div className="metric-value">{performanceData.taskQualityScore}/100</div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance & Work Hours Section */}
        <div className="performance-section">
          <h4>Attendance & Work Hours</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>Attendance Rate</label>
              <div className="metric-value">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${performanceData.attendanceRate * 100}%` }}
                  ></div>
                  <span className="progress-text">{Math.round(performanceData.attendanceRate * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="metric-item">
              <label>On-Time Rate</label>
              <div className="metric-value">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${performanceData.onTimeRate * 100}%` }}
                  ></div>
                  <span className="progress-text">{Math.round(performanceData.onTimeRate * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="metric-item">
              <label>Monthly Hours Worked</label>
              <div className="metric-value">{performanceData.monthlyHoursWorked} hours</div>
            </div>
            <div className="metric-item">
              <label>Avg Work Hours/Day</label>
              <div className="metric-value">{performanceData.avgWorkHours} hours</div>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="performance-section">
          <h4>Ratings & Reviews</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>Peer Review Score</label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editData.peerReviewScore}
                  onChange={(e) => handleInputChange('peerReviewScore', parseFloat(e.target.value))}
                  className="edit-input"
                />
              ) : (
                <div className="metric-value">
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`star ${star <= performanceData.peerReviewScore ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="rating-number">({performanceData.peerReviewScore}/5)</span>
                  </div>
                </div>
              )}
            </div>
            <div className="metric-item">
              <label>Manager Rating</label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editData.managerRating}
                  onChange={(e) => handleInputChange('managerRating', parseFloat(e.target.value))}
                  className="edit-input"
                />
              ) : (
                <div className="metric-value">
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        className={`star ${star <= performanceData.managerRating ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="rating-number">({performanceData.managerRating}/5)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Career Development Section */}
        <div className="performance-section">
          <h4>Career Development</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>Training Hours Completed</label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  value={editData.trainingHoursCompleted}
                  onChange={(e) => handleInputChange('trainingHoursCompleted', parseFloat(e.target.value))}
                  className="edit-input"
                />
              ) : (
                <div className="metric-value">{performanceData.trainingHoursCompleted} hours</div>
              )}
            </div>
            <div className="metric-item">
              <label>Promotions (Last 3 Years)</label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  value={editData.promotionsLast3Years}
                  onChange={(e) => handleInputChange('promotionsLast3Years', parseInt(e.target.value))}
                  className="edit-input"
                />
              ) : (
                <div className="metric-value">{performanceData.promotionsLast3Years}</div>
              )}
            </div>
            <div className="metric-item">
              <label>Disciplinary Actions</label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  value={editData.disciplinaryActions}
                  onChange={(e) => handleInputChange('disciplinaryActions', parseInt(e.target.value))}
                  className="edit-input"
                />
              ) : (
                <div className={`metric-value ${performanceData.disciplinaryActions > 0 ? 'warning' : 'good'}`}>
                  {performanceData.disciplinaryActions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="performance-summary">
        <h4>Performance Summary</h4>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-label">Overall Status:</span>
            <span className={`summary-value status-${performanceData.currentStatus.toLowerCase()}`}>
              {performanceData.currentStatus}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Last Updated:</span>
            <span className="summary-value">
              {new Date(performanceData.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;