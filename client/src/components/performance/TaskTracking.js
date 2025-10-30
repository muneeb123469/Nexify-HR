import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tasks and employees from backend
  useEffect(() => {
    fetchTasksAndEmployees();
  }, []);

  const fetchTasksAndEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all tasks
      const tasksResponse = await api.get('/tasks/all');
      const tasksData = tasksResponse.data.tasks || [];

      // Transform backend data to match frontend structure
      const transformedTasks = tasksData.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        employee: {
          id: task.employeeId?._id || task.employeeId,
          name: task.employeeName,
          email: task.employeeEmail
        },
        assignedDate: task.assignedDate,
        dueDate: task.dueDate,
        status: task.status.replace('_', '-'), // Convert 'in_progress' to 'in-progress'
        priority: task.priority,
        category: task.category,
        estimatedHours: task.estimatedHours,
        actualHours: 0, // This field doesn't exist in backend yet
        progress: task.progress,
        milestones: task.milestones.map(m => ({
          id: m._id,
          title: m.title,
          completed: m.completed,
          dueDate: m.dueDate
        })),
        comments: task.comments.map(c => ({
          id: c._id,
          text: c.message,
          date: c.timestamp,
          author: c.author
        }))
      }));

      setTasks(transformedTasks);
      setFilteredTasks(transformedTasks);

      // Fetch employees list
      const employeesResponse = await api.get('/tasks/employees/list');
      const employeesData = employeesResponse.data.employees || [];

      const transformedEmployees = employeesData.map(emp => ({
        id: emp._id,
        name: emp.username
      }));

      setEmployees(transformedEmployees);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks and employees:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
      setLoading(false);
    }
  };

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

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Convert status format back to backend format (e.g., 'in-progress' to 'in_progress')
      const backendStatus = newStatus.replace('-', '_');

      await api.put(`/tasks/${taskId}/status`, { status: backendStatus });

      // Update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      // Update selected task if it's the one being updated
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    }
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

  if (loading) {
    return (
      <div className="task-tracking">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-tracking">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Tasks</h3>
          <p>{error}</p>
          <button onClick={fetchTasksAndEmployees} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

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
