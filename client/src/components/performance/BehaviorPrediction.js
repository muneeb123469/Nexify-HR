import React, { useState, useEffect } from 'react';
import './BehaviorPrediction.css';

const BehaviorPrediction = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('3months');

  // Mock employee data - will be replaced with API call
  useEffect(() => {
    setEmployees([
      { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', avatar: '/api/placeholder/40/40' },
      { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', avatar: '/api/placeholder/40/40' },
      { id: 3, name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales', avatar: '/api/placeholder/40/40' },
      { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', department: 'HR', avatar: '/api/placeholder/40/40' },
      { id: 5, name: 'Alex Brown', email: 'alex@company.com', department: 'Support', avatar: '/api/placeholder/40/40' }
    ]);
  }, []);

  // Generate prediction data when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      setLoading(true);
      
      // Simulate API call with realistic prediction data
      setTimeout(() => {
        const mockPredictions = {
          1: { // John Doe
            performanceTrend: {
              direction: 'improving',
              confidence: 87,
              currentScore: 92,
              predictedScore: 95,
              factors: ['Consistent task completion', 'Skill development', 'Team collaboration']
            },
            deadlineLikelihood: {
              overall: 89,
              upcoming: [
                { task: 'Q4 System Upgrade', deadline: '2024-12-15', probability: 92, risk: 'low' },
                { task: 'API Documentation', deadline: '2024-11-30', probability: 85, risk: 'medium' },
                { task: 'Code Review Process', deadline: '2024-12-01', probability: 94, risk: 'low' }
              ]
            },
            consistency: {
              score: 91,
              trend: 'stable',
              patterns: {
                punctuality: 95,
                taskCompletion: 89,
                qualityMaintenance: 93,
                communicationFrequency: 87
              }
            },
            motivation: {
              level: 88,
              trend: 'increasing',
              indicators: {
                initiativeTaking: 92,
                learningEngagement: 85,
                teamParticipation: 90,
                feedbackReceptiveness: 86
              }
            },
            milestones: {
              achievementProbability: 91,
              upcoming: [
                { milestone: 'Senior Developer Promotion', probability: 89, timeframe: '6 months', factors: ['Technical skills', 'Leadership potential'] },
                { milestone: 'Project Lead Assignment', probability: 94, timeframe: '3 months', factors: ['Current performance', 'Team feedback'] },
                { milestone: 'Certification Completion', probability: 78, timeframe: '4 months', factors: ['Study consistency', 'Time management'] }
              ]
            },
            riskFactors: [
              { factor: 'Workload Increase', impact: 'medium', probability: 35 },
              { factor: 'Skill Gap in New Tech', impact: 'low', probability: 25 }
            ],
            recommendations: [
              'Continue current performance trajectory',
              'Consider advanced technical training',
              'Prepare for leadership responsibilities',
              'Monitor workload to prevent burnout'
            ]
          },
          2: { // Jane Smith
            performanceTrend: {
              direction: 'stable',
              confidence: 82,
              currentScore: 85,
              predictedScore: 86,
              factors: ['Steady performance', 'Good team dynamics', 'Consistent output']
            },
            deadlineLikelihood: {
              overall: 83,
              upcoming: [
                { task: 'Campaign Launch', deadline: '2024-11-25', probability: 88, risk: 'low' },
                { task: 'Brand Guidelines Update', deadline: '2024-12-10', probability: 79, risk: 'medium' },
                { task: 'Market Research Report', deadline: '2024-12-05', probability: 85, risk: 'medium' }
              ]
            },
            consistency: {
              score: 84,
              trend: 'stable',
              patterns: {
                punctuality: 88,
                taskCompletion: 82,
                qualityMaintenance: 86,
                communicationFrequency: 81
              }
            },
            motivation: {
              level: 79,
              trend: 'stable',
              indicators: {
                initiativeTaking: 75,
                learningEngagement: 82,
                teamParticipation: 80,
                feedbackReceptiveness: 79
              }
            },
            milestones: {
              achievementProbability: 82,
              upcoming: [
                { milestone: 'Marketing Manager Role', probability: 76, timeframe: '8 months', factors: ['Leadership development', 'Strategic thinking'] },
                { milestone: 'Digital Marketing Certification', probability: 89, timeframe: '2 months', factors: ['Current progress', 'Dedication'] },
                { milestone: 'Team Lead Assignment', probability: 71, timeframe: '6 months', factors: ['Management skills', 'Team dynamics'] }
              ]
            },
            riskFactors: [
              { factor: 'Creative Block', impact: 'medium', probability: 28 },
              { factor: 'Market Changes', impact: 'low', probability: 40 }
            ],
            recommendations: [
              'Focus on leadership skill development',
              'Increase initiative-taking opportunities',
              'Consider mentorship programs',
              'Explore creative development workshops'
            ]
          },
          3: { // Mike Johnson
            performanceTrend: {
              direction: 'declining',
              confidence: 78,
              currentScore: 72,
              predictedScore: 68,
              factors: ['Missed deadlines', 'Decreased engagement', 'Quality concerns']
            },
            deadlineLikelihood: {
              overall: 65,
              upcoming: [
                { task: 'Client Presentation', deadline: '2024-11-28', probability: 71, risk: 'high' },
                { task: 'Sales Report Q4', deadline: '2024-12-15', probability: 58, risk: 'high' },
                { task: 'Lead Follow-up', deadline: '2024-11-22', probability: 69, risk: 'medium' }
              ]
            },
            consistency: {
              score: 68,
              trend: 'declining',
              patterns: {
                punctuality: 72,
                taskCompletion: 65,
                qualityMaintenance: 70,
                communicationFrequency: 64
              }
            },
            motivation: {
              level: 61,
              trend: 'decreasing',
              indicators: {
                initiativeTaking: 58,
                learningEngagement: 62,
                teamParticipation: 64,
                feedbackReceptiveness: 60
              }
            },
            milestones: {
              achievementProbability: 58,
              upcoming: [
                { milestone: 'Sales Target Achievement', probability: 52, timeframe: '2 months', factors: ['Current trajectory', 'Market conditions'] },
                { milestone: 'Client Retention Goal', probability: 64, timeframe: '4 months', factors: ['Relationship management', 'Service quality'] },
                { milestone: 'Performance Improvement', probability: 71, timeframe: '3 months', factors: ['Support provided', 'Personal commitment'] }
              ]
            },
            riskFactors: [
              { factor: 'Performance Decline', impact: 'high', probability: 72 },
              { factor: 'Team Morale Impact', impact: 'medium', probability: 45 },
              { factor: 'Client Relationship Risk', impact: 'high', probability: 38 }
            ],
            recommendations: [
              'Immediate performance intervention required',
              'Schedule one-on-one coaching sessions',
              'Identify and address underlying issues',
              'Provide additional training and support',
              'Consider workload redistribution'
            ]
          }
        };

        const selectedEmpId = parseInt(selectedEmployee);
        setPredictionData(mockPredictions[selectedEmpId] || mockPredictions[1]);
        setLoading(false);
      }, 1500);
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

        <div className="employee-selection">
          <div className="selection-card">
            <div className="selection-icon">👥</div>
            <h3>Choose Employee for Analysis</h3>
            <p>Get intelligent predictions about future performance, engagement, and milestone achievements</p>
            
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
