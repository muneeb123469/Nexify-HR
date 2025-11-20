import React, { useState, useEffect } from 'react';
import './BehaviorPrediction.css';
import { useAuth } from '../../context/AuthContext';

const BehaviorPrediction = () => {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('3months');
  const [error, setError] = useState(null);

  // Fetch real employee data from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/employees', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data = await response.json();
        const formattedEmployees = data.employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          department: emp.department,
          avatar: '/api/placeholder/40/40'
        }));

        setEmployees(formattedEmployees);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees');
      }
    };

    fetchEmployees();
  }, []);

  // Calculate prediction data based on real performance metrics
  const calculatePredictions = async (employeeId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch performance data
      const perfResponse = await fetch(`http://localhost:5000/api/employees/performance/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch task stats
      const taskResponse = await fetch(`http://localhost:5000/api/tasks/stats/employee/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!perfResponse.ok || !taskResponse.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const perfData = await perfResponse.json();
      const taskStats = await taskResponse.json();

      // Calculate performance trend based on actual data
      const taskCompletionRate = taskStats.completionRate || 0;
      const attendanceRate = perfData.attendanceRate || 0;
      const currentScore = Math.round((taskCompletionRate + attendanceRate) / 2);
      
      // Determine trend direction
      let direction = 'stable';
      let confidence = 75;
      let predictedScore = currentScore;

      if (taskCompletionRate > 80 && attendanceRate > 90) {
        direction = 'improving';
        confidence = 85;
        predictedScore = Math.min(100, currentScore + 5);
      } else if (taskCompletionRate < 60 || attendanceRate < 70) {
        direction = 'declining';
        confidence = 78;
        predictedScore = Math.max(0, currentScore - 5);
      }

      // Build prediction data
      const predictions = {
        performanceTrend: {
          direction,
          confidence,
          currentScore,
          predictedScore,
          factors: generateFactors(taskStats, perfData)
        },
        deadlineLikelihood: {
          overall: taskCompletionRate,
          upcoming: generateUpcomingTasks(taskStats)
        },
        consistency: {
          score: Math.round((perfData.onTimeRate * 100) || 75),
          trend: direction,
          patterns: {
            punctuality: Math.round((perfData.onTimeRate * 100) || 85),
            taskCompletion: taskStats.completionRate || 0,
            qualityMaintenance: Math.round((perfData.taskQualityScore || 75)),
            communicationFrequency: Math.round((perfData.peerReviewScore || 75))
          }
        },
        motivation: {
          level: Math.round((currentScore * 0.9) || 75),
          trend: direction === 'improving' ? 'increasing' : direction === 'declining' ? 'decreasing' : 'stable',
          indicators: {
            initiativeTaking: Math.round((perfData.managerRating || 75)),
            learningEngagement: Math.round((perfData.trainingHoursCompleted > 0 ? 80 : 60)),
            teamParticipation: Math.round((perfData.peerReviewScore || 75)),
            feedbackReceptiveness: Math.round((perfData.managerRating || 75))
          }
        },
        milestones: {
          achievementProbability: taskStats.completionRate || 70,
          upcoming: generateMilestones(perfData, taskStats)
        },
        riskFactors: generateRiskFactors(perfData, taskStats),
        recommendations: generateRecommendations(perfData, taskStats, direction)
      };

      return predictions;
    } catch (err) {
      console.error('Error calculating predictions:', err);
      throw err;
    }
  };

  // Helper function to generate factors
  const generateFactors = (taskStats, perfData) => {
    const factors = [];
    
    if (taskStats.completionRate > 80) {
      factors.push('Consistent task completion');
    }
    if (perfData.trainingHoursCompleted > 0) {
      factors.push('Skill development');
    }
    if (perfData.peerReviewScore > 75) {
      factors.push('Team collaboration');
    }
    if (perfData.attendanceRate > 0.9) {
      factors.push('Strong attendance');
    }
    
    return factors.length > 0 ? factors : ['Performance tracking in progress'];
  };

  // Helper function to generate upcoming tasks
  const generateUpcomingTasks = (taskStats) => {
    const upcoming = [];
    const baseDate = new Date();
    
    if (taskStats.pending > 0) {
      upcoming.push({
        task: `${taskStats.pending} Pending Task${taskStats.pending > 1 ? 's' : ''}`,
        deadline: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability: Math.max(50, 100 - (taskStats.pending * 10)),
        risk: taskStats.pending > 3 ? 'high' : taskStats.pending > 1 ? 'medium' : 'low'
      });
    }
    
    if (taskStats.inProgress > 0) {
      upcoming.push({
        task: `${taskStats.inProgress} In-Progress Task${taskStats.inProgress > 1 ? 's' : ''}`,
        deadline: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability: 75,
        risk: 'medium'
      });
    }
    
    if (taskStats.overdue > 0) {
      upcoming.push({
        task: `${taskStats.overdue} Overdue Task${taskStats.overdue > 1 ? 's' : ''}`,
        deadline: new Date().toISOString().split('T')[0],
        probability: 40,
        risk: 'high'
      });
    }

    return upcoming.length > 0 ? upcoming : [
      {
        task: 'No active tasks',
        deadline: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        probability: 100,
        risk: 'low'
      }
    ];
  };

  // Helper function to generate milestones
  const generateMilestones = (perfData, taskStats) => {
    const milestones = [];
    
    if (taskStats.completionRate > 80) {
      milestones.push({
        milestone: 'Performance Excellence',
        probability: Math.min(95, taskStats.completionRate + 10),
        timeframe: '3 months',
        factors: ['Current trajectory', 'Consistent performance']
      });
    }
    
    if (perfData.trainingHoursCompleted > 0) {
      milestones.push({
        milestone: 'Skill Certification',
        probability: 75,
        timeframe: '6 months',
        factors: ['Training progress', 'Learning commitment']
      });
    }
    
    milestones.push({
      milestone: 'Career Advancement',
      probability: Math.max(50, taskStats.completionRate - 10),
      timeframe: '12 months',
      factors: ['Performance metrics', 'Experience level']
    });

    return milestones;
  };

  // Helper function to generate risk factors
  const generateRiskFactors = (perfData, taskStats) => {
    const risks = [];
    
    if (taskStats.overdue > 0) {
      risks.push({
        factor: 'Overdue Tasks',
        impact: 'high',
        probability: Math.min(95, taskStats.overdue * 20)
      });
    }
    
    if (taskStats.pending > 3) {
      risks.push({
        factor: 'High Workload',
        impact: 'medium',
        probability: 60
      });
    }
    
    if (perfData.attendanceRate < 0.8) {
      risks.push({
        factor: 'Attendance Issues',
        impact: 'medium',
        probability: 50
      });
    }

    return risks.length > 0 ? risks : [
      {
        factor: 'No significant risks identified',
        impact: 'low',
        probability: 10
      }
    ];
  };

  // Helper function to generate recommendations
  const generateRecommendations = (perfData, taskStats, direction) => {
    const recommendations = [];
    
    if (direction === 'improving') {
      recommendations.push('Continue current performance trajectory');
      recommendations.push('Consider advanced skill development');
      recommendations.push('Prepare for increased responsibilities');
    } else if (direction === 'declining') {
      recommendations.push('Schedule performance review meeting');
      recommendations.push('Identify and address challenges');
      recommendations.push('Provide additional support and resources');
    } else {
      recommendations.push('Maintain current performance level');
      recommendations.push('Explore growth opportunities');
    }
    
    if (taskStats.overdue > 0) {
      recommendations.push('Focus on completing overdue tasks');
    }
    
    if (perfData.trainingHoursCompleted === 0) {
      recommendations.push('Encourage professional development');
    }

    return recommendations;
  };

  // Generate prediction data when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      setLoading(true);
      setError(null);
      
      calculatePredictions(selectedEmployee)
        .then(predictions => {
          setPredictionData(predictions);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error:', err);
          setError('Failed to load predictions');
          setLoading(false);
        });
    }
  }, [selectedEmployee, timeframe]);

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'improving': return '#10b981';
      case 'declining': return '#ef4444';
      case 'stable': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getConfidenceLevel = (score) => {
    if (score >= 85) return { level: 'High', color: '#10b981' };
    if (score >= 70) return { level: 'Medium', color: '#f59e0b' };
    return { level: 'Low', color: '#ef4444' };
  };

  if (!selectedEmployee) {
    return (
      <div className="behavior-prediction">
        <div className="prediction-header">
          <h2>🔮 Behavior Prediction & Forecasting</h2>
          <p>Select an employee to view AI-powered performance predictions and behavioral insights</p>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            margin: '16px 0',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#991b1b'
          }}>
            {error}
          </div>
        )}

        <div className="employee-selection">
          <div className="selection-card">
            <div className="selection-icon">👥</div>
            <h3>Choose Employee for Analysis</h3>
            <p>Get intelligent predictions about future performance, engagement, and milestone achievements</p>
            
            {employees.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                Loading employees...
              </p>
            ) : (
              <div className="employee-grid">
                {employees.map(employee => (
                  <div 
                    key={employee.id} 
                    className="employee-card"
                    onClick={() => setSelectedEmployee(employee.id.toString())}
                  >
                    <div className="employee-avatar">
                      <img src={employee.avatar} alt={employee.name} />
                    </div>
                    <div className="employee-info">
                      <h4>{employee.name}</h4>
                      <p>{employee.department}</p>
                      <span className="employee-email">{employee.email}</span>
                    </div>
                    <div className="select-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="prediction-features">
          <h3>🎯 Prediction Capabilities</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Performance Trends</h4>
              <p>Forecast improving, declining, or stable performance patterns</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h4>Deadline Likelihood</h4>
              <p>Predict probability of meeting future deadlines and targets</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Consistency Analysis</h4>
              <p>Analyze behavioral patterns and motivation levels</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h4>Milestone Probability</h4>
              <p>Forecast achievement likelihood for upcoming goals</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="behavior-prediction">
        <div className="prediction-loading">
          <div className="loading-animation">
            <div className="ai-brain">🧠</div>
            <div className="loading-text">
              <h3>Analyzing Employee Data...</h3>
              <p>Processing historical patterns and generating predictions</p>
            </div>
          </div>
          <div className="loading-steps">
            <div className="step active">📊 Gathering performance data</div>
            <div className="step active">🔍 Analyzing behavioral patterns</div>
            <div className="step active">🤖 Running AI predictions</div>
            <div className="step">✨ Generating insights</div>
          </div>
        </div>
      </div>
    );
  }

  const selectedEmp = employees.find(emp => emp.id.toString() === selectedEmployee);
  const confidence = getConfidenceLevel(predictionData?.performanceTrend?.confidence || 0);

  return (
    <div className="behavior-prediction">
      {/* Header with Employee Info */}
      <div className="prediction-header">
        <div className="employee-header">
          <div className="employee-details">
            <img src={selectedEmp?.avatar} alt={selectedEmp?.name} className="employee-avatar-large" />
            <div className="employee-meta">
              <h2>{selectedEmp?.name}</h2>
              <p>{selectedEmp?.department} • {selectedEmp?.email}</p>
            </div>
          </div>
          <div className="prediction-controls">
            <div className="timeframe-selector">
              <label>Prediction Timeframe:</label>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="1month">Next Month</option>
                <option value="3months">Next 3 Months</option>
                <option value="6months">Next 6 Months</option>
                <option value="1year">Next Year</option>
              </select>
            </div>
            <button 
              className="change-employee-btn"
              onClick={() => setSelectedEmployee('')}
            >
              Change Employee
            </button>
          </div>
        </div>
        
        <div className="confidence-indicator">
          <div className="confidence-badge" style={{ backgroundColor: confidence.color }}>
            <span className="confidence-level">{confidence.level} Confidence</span>
            <span className="confidence-score">{predictionData?.performanceTrend?.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Main Predictions Dashboard */}
      <div className="predictions-dashboard">
        {/* Performance Trend Prediction */}
        <div className="prediction-section performance-trend">
          <div className="section-header">
            <h3>📈 Performance Trend Prediction</h3>
            <div 
              className="trend-indicator"
              style={{ color: getTrendColor(predictionData?.performanceTrend?.direction) }}
            >
              {getTrendIcon(predictionData?.performanceTrend?.direction)} {predictionData?.performanceTrend?.direction?.toUpperCase()}
            </div>
          </div>
          
          <div className="trend-content">
            <div className="score-comparison">
              <div className="score-item current">
                <span className="score-label">Current Score</span>
                <span className="score-value">{predictionData?.performanceTrend?.currentScore}</span>
              </div>
              <div className="score-arrow">→</div>
              <div className="score-item predicted">
                <span className="score-label">Predicted Score</span>
                <span className="score-value" style={{ color: getTrendColor(predictionData?.performanceTrend?.direction) }}>
                  {predictionData?.performanceTrend?.predictedScore}
                </span>
              </div>
            </div>
            
            <div className="trend-factors">
              <h4>Key Factors:</h4>
              <ul>
                {predictionData?.performanceTrend?.factors?.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Deadline Likelihood */}
        <div className="prediction-section deadline-likelihood">
          <div className="section-header">
            <h3>⏰ Deadline Likelihood Analysis</h3>
            <div className="overall-likelihood">
              <span className="likelihood-score">{predictionData?.deadlineLikelihood?.overall}%</span>
              <span className="likelihood-label">Overall Success Rate</span>
            </div>
          </div>
          
          <div className="upcoming-deadlines">
            <h4>Upcoming Tasks & Probabilities:</h4>
            <div className="deadlines-list">
              {predictionData?.deadlineLikelihood?.upcoming?.map((task, index) => (
                <div key={index} className="deadline-item">
                  <div className="task-info">
                    <h5>{task.task}</h5>
                    <span className="task-deadline">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="probability-info">
                    <div className="probability-bar">
                      <div 
                        className="probability-fill"
                        style={{ 
                          width: `${task.probability}%`,
                          backgroundColor: getRiskColor(task.risk === 'low' ? 'low' : task.risk === 'medium' ? 'medium' : 'high')
                        }}
                      />
                    </div>
                    <span className="probability-text">{task.probability}%</span>
                    <span className={`risk-badge ${task.risk}`}>{task.risk} risk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Consistency & Motivation */}
        <div className="prediction-section consistency-motivation">
          <div className="section-header">
            <h3>🎯 Consistency & Motivation Analysis</h3>
          </div>
          
          <div className="consistency-motivation-grid">
            <div className="consistency-card">
              <h4>Consistency Score</h4>
              <div className="score-circle">
                <div className="circle-progress" style={{ '--progress': predictionData?.consistency?.score }}>
                  <span className="score-number">{predictionData?.consistency?.score}</span>
                </div>
              </div>
              <div className="trend-info">
                <span className={`trend ${predictionData?.consistency?.trend}`}>
                  {getTrendIcon(predictionData?.consistency?.trend)} {predictionData?.consistency?.trend}
                </span>
              </div>
              
              <div className="pattern-breakdown">
                <h5>Pattern Analysis:</h5>
                {Object.entries(predictionData?.consistency?.patterns || {}).map(([key, value]) => (
                  <div key={key} className="pattern-item">
                    <span className="pattern-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    <div className="pattern-bar">
                      <div className="pattern-fill" style={{ width: `${value}%` }} />
                    </div>
                    <span className="pattern-value">{value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="motivation-card">
              <h4>Motivation Level</h4>
              <div className="score-circle">
                <div className="circle-progress" style={{ '--progress': predictionData?.motivation?.level }}>
                  <span className="score-number">{predictionData?.motivation?.level}</span>
                </div>
              </div>
              <div className="trend-info">
                <span className={`trend ${predictionData?.motivation?.trend}`}>
                  {getTrendIcon(predictionData?.motivation?.trend)} {predictionData?.motivation?.trend}
                </span>
              </div>
              
              <div className="indicator-breakdown">
                <h5>Motivation Indicators:</h5>
                {Object.entries(predictionData?.motivation?.indicators || {}).map(([key, value]) => (
                  <div key={key} className="indicator-item">
                    <span className="indicator-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    <div className="indicator-bar">
                      <div className="indicator-fill" style={{ width: `${value}%` }} />
                    </div>
                    <span className="indicator-value">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Achievement Probability */}
        <div className="prediction-section milestone-probability">
          <div className="section-header">
            <h3>🏆 Milestone Achievement Probability</h3>
            <div className="overall-probability">
              <span className="probability-score">{predictionData?.milestones?.achievementProbability}%</span>
              <span className="probability-label">Success Likelihood</span>
            </div>
          </div>
          
          <div className="milestones-list">
            {predictionData?.milestones?.upcoming?.map((milestone, index) => (
              <div key={index} className="milestone-card">
                <div className="milestone-header">
                  <h4>{milestone.milestone}</h4>
                  <div className="milestone-probability">
                    <div className="probability-circle" style={{ '--probability': milestone.probability }}>
                      <span>{milestone.probability}%</span>
                    </div>
                  </div>
                </div>
                <div className="milestone-details">
                  <div className="milestone-timeframe">
                    <span className="timeframe-label">Expected in:</span>
                    <span className="timeframe-value">{milestone.timeframe}</span>
                  </div>
                  <div className="milestone-factors">
                    <span className="factors-label">Key factors:</span>
                    <div className="factors-list">
                      {milestone.factors.map((factor, idx) => (
                        <span key={idx} className="factor-tag">{factor}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors & Recommendations */}
        <div className="prediction-section risk-recommendations">
          <div className="risk-factors">
            <h3>⚠️ Risk Factors</h3>
            <div className="risk-list">
              {predictionData?.riskFactors?.map((risk, index) => (
                <div key={index} className="risk-item">
                  <div className="risk-info">
                    <h4>{risk.factor}</h4>
                    <span className={`impact-badge ${risk.impact}`}>{risk.impact} impact</span>
                  </div>
                  <div className="risk-probability">
                    <div className="risk-bar">
                      <div 
                        className="risk-fill"
                        style={{ 
                          width: `${risk.probability}%`,
                          backgroundColor: getRiskColor(risk.impact === 'high' ? 'high' : risk.impact === 'medium' ? 'medium' : 'low')
                        }}
                      />
                    </div>
                    <span>{risk.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="recommendations">
            <h3>💡 AI Recommendations</h3>
            <div className="recommendations-list">
              {predictionData?.recommendations?.map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-icon">🎯</div>
                  <span className="recommendation-text">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorPrediction;
