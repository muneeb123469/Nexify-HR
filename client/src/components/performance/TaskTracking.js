import React, { useState, useEffect } from 'react';
import './TaskTracking.css';

const TaskTracking = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    employee: 'all',
    dateRange: 'all'
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockTasks = [
      {
        id: 1,
        title: 'Complete Q4 Financial Report',
        description: 'Prepare comprehensive financial analysis for Q4 2024',
        employee: { id: 1, name: 'John Doe', email: 'john@company.com' },
        assignedDate: '2024-01-01',
        dueDate: '2024-01-15',
        status: 'in-progress',
        priority: 'high',
        category: 'admin',
        estimatedHours: 20,
        actualHours: 12,
        progress: 60,
        milestones: [
          { id: 1, title: 'Data Collection', completed: true, dueDate: '2024-01-05' },
          { id: 2, title: 'Analysis & Charts', completed: true, dueDate: '2024-01-10' },
          { id: 3, title: 'Final Review', completed: false, dueDate: '2024-01-14' }
        ],
        comments: [
          { id: 1, text: 'Started data collection', date: '2024-01-02', author: 'John Doe' },
          { id: 2, text: 'Completed initial analysis', date: '2024-01-08', author: 'John Doe' }
        ]
      },
      {
        id: 2,
        title: 'Update Marketing Campaign',
        description: 'Revise social media marketing strategy for new product launch',
        employee: { id: 2, name: 'Jane Smith', email: 'jane@company.com' },
        assignedDate: '2024-01-03',
        dueDate: '2024-01-12',
        status: 'completed',
        priority: 'medium',
        category: 'marketing',
        estimatedHours: 15,
        actualHours: 14,
        progress: 100,
        milestones: [
          { id: 1, title: 'Market Research', completed: true, dueDate: '2024-01-06' },
          { id: 2, title: 'Strategy Development', completed: true, dueDate: '2024-01-09' },
          { id: 3, title: 'Campaign Launch', completed: true, dueDate: '2024-01-12' }
        ],
        comments: [
          { id: 1, text: 'Research completed ahead of schedule', date: '2024-01-05', author: 'Jane Smith' },
          { id: 2, text: 'Campaign launched successfully', date: '2024-01-12', author: 'Jane Smith' }
        ]
      },
      {
        id: 3,
        title: 'Client Follow-up Calls',
        description: 'Contact all pending clients for project updates',
        employee: { id: 3, name: 'Mike Johnson', email: 'mike@company.com' },
        assignedDate: '2024-01-05',
        dueDate: '2024-01-10',
        status: 'overdue',
        priority: 'high',
        category: 'sales',
        estimatedHours: 8,
        actualHours: 3,
        progress: 30,
        milestones: [
          { id: 1, title: 'Prepare Client List', completed: true, dueDate: '2024-01-06' },
          { id: 2, title: 'Initial Calls', completed: false, dueDate: '2024-01-08' },
          { id: 3, title: 'Follow-up & Reports', completed: false, dueDate: '2024-01-10' }
        ],
        comments: [
          { id: 1, text: 'Client list prepared', date: '2024-01-06', author: 'Mike Johnson' }
        ]
      },
      {
        id: 4,
        title: 'System Security Audit',
        description: 'Conduct comprehensive security review of all systems',
        employee: { id: 1, name: 'John Doe', email: 'john@company.com' },
        assignedDate: '2024-01-08',
        dueDate: '2024-01-20',
        status: 'pending',
        priority: 'high',
        category: 'development',
        estimatedHours: 25,
        actualHours: 0,
        progress: 0,
        milestones: [
          { id: 1, title: 'Initial Assessment', completed: false, dueDate: '2024-01-12' },
          { id: 2, title: 'Vulnerability Testing', completed: false, dueDate: '2024-01-16' },
          { id: 3, title: 'Report Generation', completed: false, dueDate: '2024-01-19' }
        ],
        comments: []
      }
    ];

    setTasks(mockTasks);
    setFilteredTasks(mockTasks);

    setEmployees([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Mike Johnson' },
      { id: 4, name: 'Sarah Wilson' }
    ]);
  }, []);

  // Filter tasks based on selected filters
  useEffect(() => {
    let filtered = tasks;

    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.employee !== 'all') {
      filtered = filtered.filter(task => task.employee.id === parseInt(filters.employee));
    }

    setFilteredTasks(filtered);
  }, [filters, tasks]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setShowTaskModal(false);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    return { total, completed, inProgress, overdue, pending };
  };

  const stats = getTaskStats();

  return (
    <div className="task-tracking">
      {/* Stats Overview */}
      <div className="tracking-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-number">{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="tracking-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Priority:</label>
          <select 
            value={filters.priority} 
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Employee:</label>
          <select 
            value={filters.employee} 
            onChange={(e) => handleFilterChange('employee', e.target.value)}
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range:</label>
          <select 
            value={filters.dateRange} 
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="tasks-grid">
        {filteredTasks.map(task => (
          <div key={task.id} className="task-card" onClick={() => openTaskModal(task)}>
            <div className="task-header">
              <h3>{task.title}</h3>
              <div className="task-badges">
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                >
                  {task.priority}
                </span>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status}
                </span>
              </div>
            </div>

            <div className="task-employee">
              <span className="employee-name">👤 {task.employee.name}</span>
            </div>

            <div className="task-progress">
              <div className="progress-info">
                <span>Progress: {task.progress}%</span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${task.progress}%`,
                    backgroundColor: getProgressColor(task.progress)
                  }}
                />
              </div>
            </div>

            <div className="task-milestones">
              <div className="milestone-summary">
                {task.milestones.filter(m => m.completed).length} / {task.milestones.length} milestones completed
              </div>
              <div className="milestone-dots">
                {task.milestones.map(milestone => (
                  <div 
                    key={milestone.id}
                    className={`milestone-dot ${milestone.completed ? 'completed' : 'pending'}`}
                  />
                ))}
              </div>
            </div>

            <div className="task-time">
              <span>⏱️ {task.actualHours}h / {task.estimatedHours}h</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="no-tasks">
          <div className="no-tasks-icon">📋</div>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters to see more tasks.</p>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="modal-overlay" onClick={closeTaskModal}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTask.title}</h2>
              <button className="close-modal" onClick={closeTaskModal}>✕</button>
            </div>

            <div className="modal-content">
              <div className="task-details-grid">
                <div className="task-main-info">
                  <div className="detail-section">
                    <h4>Description</h4>
                    <p>{selectedTask.description}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Milestones Progress</h4>
                    <div className="milestones-progress">
                      {selectedTask.milestones.map(milestone => (
                        <div key={milestone.id} className="milestone-progress-item">
                          <div className="milestone-status">
                            <span className={`milestone-check ${milestone.completed ? 'completed' : 'pending'}`}>
                              {milestone.completed ? '✓' : '○'}
                            </span>
                            <span className="milestone-title">{milestone.title}</span>
                          </div>
                          <span className="milestone-due">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Comments & Updates</h4>
                    <div className="comments-list">
                      {selectedTask.comments.length > 0 ? (
                        selectedTask.comments.map(comment => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <span className="comment-author">{comment.author}</span>
                              <span className="comment-date">{new Date(comment.date).toLocaleDateString()}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="no-comments">No comments yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="task-sidebar-info">
                  <div className="info-card">
                    <h4>Task Information</h4>
                    <div className="info-item">
                      <label>Employee:</label>
                      <span>{selectedTask.employee.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Status:</label>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedTask.status) }}
                      >
                        {selectedTask.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Priority:</label>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(selectedTask.priority) }}
                      >
                        {selectedTask.priority}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Category:</label>
                      <span>{selectedTask.category}</span>
                    </div>
                    <div className="info-item">
                      <label>Assigned:</label>
                      <span>{new Date(selectedTask.assignedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Due Date:</label>
                      <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="info-card">
                    <h4>Time Tracking</h4>
                    <div className="time-progress">
                      <div className="time-info">
                        <span>Actual: {selectedTask.actualHours}h</span>
                        <span>Estimated: {selectedTask.estimatedHours}h</span>
                      </div>
                      <div className="time-bar">
                        <div 
                          className="time-fill"
                          style={{ 
                            width: `${Math.min((selectedTask.actualHours / selectedTask.estimatedHours) * 100, 100)}%`,
                            backgroundColor: selectedTask.actualHours > selectedTask.estimatedHours ? '#ef4444' : '#10b981'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <h4>Progress</h4>
                    <div className="progress-circle">
                      <div className="progress-text">{selectedTask.progress}%</div>
                    </div>
                  </div>

                  <div className="status-actions">
                    <h4>Update Status</h4>
                    <div className="status-buttons">
                      <button 
                        className="status-btn pending"
                        onClick={() => updateTaskStatus(selectedTask.id, 'pending')}
                      >
                        Pending
                      </button>
                      <button 
                        className="status-btn in-progress"
                        onClick={() => updateTaskStatus(selectedTask.id, 'in-progress')}
                      >
                        In Progress
                      </button>
                      <button 
                        className="status-btn completed"
                        onClick={() => updateTaskStatus(selectedTask.id, 'completed')}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTracking;
