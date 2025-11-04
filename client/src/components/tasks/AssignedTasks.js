import React, { useState, useEffect } from 'react';
import { EmployerSideBar } from '../dashboard/EmployeeDashboard';
import { useAuth } from '../../context/AuthContext';
import './AssignedTasks.css';

const AssignedTasks = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [tempProgress, setTempProgress] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock data - will be replaced with API calls
  const mockTasks = [
    {
      id: 1,
      title: "Complete Q4 Sales Report",
      description: "Prepare comprehensive sales analysis for Q4 including charts, trends, and recommendations for next quarter.",
      priority: "high",
      status: "pending",
      dueDate: "2024-01-15",
      assignedBy: "Sarah Johnson (HR Manager)",
      assignedDate: "2024-01-01",
      category: "reporting",
      estimatedHours: 8,
      progress: 0,
      milestones: [
        { id: 1, title: "Data Collection", completed: false, dueDate: "2024-01-08" },
        { id: 2, title: "Analysis & Charts", completed: false, dueDate: "2024-01-12" },
        { id: 3, title: "Final Report", completed: false, dueDate: "2024-01-15" }
      ],
      comments: [
        {
          id: 1,
          author: "Sarah Johnson",
          role: "HR Manager",
          message: "Please focus on regional performance comparison in your analysis.",
          timestamp: "2024-01-02T10:30:00Z",
          type: "instruction"
        }
      ],
      attachments: []
    },
    {
      id: 2,
      title: "Update Employee Handbook",
      description: "Review and update the employee handbook with new policies and procedures implemented in 2024.",
      priority: "medium",
      status: "in_progress",
      dueDate: "2024-01-20",
      assignedBy: "Mike Chen (Admin)",
      assignedDate: "2023-12-28",
      category: "documentation",
      estimatedHours: 12,
      progress: 35,
      milestones: [
        { id: 1, title: "Policy Review", completed: true, dueDate: "2024-01-05" },
        { id: 2, title: "Content Updates", completed: false, dueDate: "2024-01-15" },
        { id: 3, title: "Final Review", completed: false, dueDate: "2024-01-20" }
      ],
      comments: [
        {
          id: 1,
          author: "Mike Chen",
          role: "Admin",
          message: "Great progress on the policy review! Please ensure all new remote work policies are included.",
          timestamp: "2024-01-06T14:20:00Z",
          type: "feedback"
        },
        {
          id: 2,
          author: user?.name || "John Doe",
          role: "Employee",
          message: "I've completed the policy review section. Moving on to content updates now.",
          timestamp: "2024-01-06T16:45:00Z",
          type: "update"
        }
      ],
      attachments: [
        { id: 1, name: "policy_changes_draft.pdf", size: "2.3 MB", uploadedAt: "2024-01-06" }
      ]
    },
    {
      id: 3,
      title: "Team Training Presentation",
      description: "Prepare and deliver a training presentation on new software tools for the development team.",
      priority: "medium",
      status: "completed",
      dueDate: "2024-01-10",
      assignedBy: "Sarah Johnson (HR Manager)",
      assignedDate: "2023-12-20",
      category: "training",
      estimatedHours: 6,
      progress: 100,
      completedDate: "2024-01-09",
      milestones: [
        { id: 1, title: "Content Preparation", completed: true, dueDate: "2024-01-05" },
        { id: 2, title: "Presentation Creation", completed: true, dueDate: "2024-01-08" },
        { id: 3, title: "Delivery", completed: true, dueDate: "2024-01-10" }
      ],
      comments: [
        {
          id: 1,
          author: "Sarah Johnson",
          role: "HR Manager",
          message: "Excellent presentation! The team found it very helpful. Well done!",
          timestamp: "2024-01-09T17:30:00Z",
          type: "feedback"
        }
      ],
      attachments: [
        { id: 1, name: "training_presentation.pptx", size: "15.7 MB", uploadedAt: "2024-01-08" }
      ]
    },
    {
      id: 4,
      title: "Database Optimization Review",
      description: "Analyze current database performance and provide recommendations for optimization.",
      priority: "high",
      status: "overdue",
      dueDate: "2024-01-05",
      assignedBy: "Mike Chen (Admin)",
      assignedDate: "2023-12-15",
      category: "technical",
      estimatedHours: 16,
      progress: 60,
      milestones: [
        { id: 1, title: "Performance Analysis", completed: true, dueDate: "2023-12-28" },
        { id: 2, title: "Optimization Plan", completed: false, dueDate: "2024-01-03" },
        { id: 3, title: "Implementation Guide", completed: false, dueDate: "2024-01-05" }
      ],
      comments: [
        {
          id: 1,
          author: "Mike Chen",
          role: "Admin",
          message: "This task is now overdue. Please provide an update on your progress and expected completion date.",
          timestamp: "2024-01-06T09:00:00Z",
          type: "urgent"
        }
      ],
      attachments: []
    }
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks/my-tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      
      // Map backend data to frontend format if needed
      const formattedTasks = data.tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status || 'pending',
        dueDate: task.dueDate,
        assignedBy: `${task.assignedByName} (${task.assignedByRole})`,
        assignedDate: task.createdAt,
        category: task.category,
        estimatedHours: task.estimatedHours,
        progress: task.progress || 0,
        completedDate: task.completedDate,
        milestones: task.milestones || [],
        comments: task.comments || [],
        attachments: task.attachments || []
      }));
      
      setTasks(formattedTasks);
      setFilteredTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback to mock data if API fails
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterTasks();
  }, [filters, tasks]);

  useEffect(() => {
    if (selectedTask) {
      setTempProgress(selectedTask.progress || 0);
      setHasUnsavedChanges(false);
    }
  }, [selectedTask]);

  const filterTasks = () => {
    let filtered = [...tasks];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa726';
      case 'in_progress': return '#42a5f5';
      case 'completed': return '#66bb6a';
      case 'overdue': return '#ef5350';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef5350';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#9e9e9e';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;

    if (diffTime < 0) {
      return 'Overdue';
    }

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours}h remaining`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const data = await response.json();

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId || task.id === taskId ? {...task, status: newStatus} : task
        )
      );

      // Update selected task if it's the one being updated
      if (selectedTask && (selectedTask._id === taskId || selectedTask.id === taskId)) {
        setSelectedTask({...selectedTask, status: newStatus});
      }

      alert('Task status updated successfully!');
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleProgressChange = (value) => {
    setTempProgress(parseInt(value));
    setHasUnsavedChanges(true);
  };

  const handleEstimatedHoursChange = (e) => {
    const newHours = e.target.value;
    setSelectedTask({
      ...selectedTask,
      estimatedHours: newHours
    });
    setHasUnsavedChanges(true);
  };

  const saveProgressChanges = async () => {
    if (!selectedTask) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${selectedTask._id || selectedTask.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          progress: tempProgress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task progress');
      }

      const data = await response.json();

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === selectedTask._id || task.id === selectedTask.id ? {
            ...task,
            progress: tempProgress,
            status: selectedTask.status,
            estimatedHours: selectedTask.estimatedHours
          } : task
        )
      );

      // Update selected task
      setSelectedTask({...selectedTask, progress: tempProgress});
      setHasUnsavedChanges(false);

      alert('Task progress updated successfully!');
    } catch (error) {
      console.error('Error updating task progress:', error);
      alert('Failed to update task progress. Please try again.');
    }
  };

  const addComment = async (taskId, comment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: comment, type: 'update' })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? data.task : task
        )
      );

      // Update selected task if it's the one being updated
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(data.task);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const TaskOverview = () => (
    <div className="task-overview">
      <div className="task-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      <div className="task-stats">
        <div className="stat-card">
          <div className="stat-number">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => t.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => t.status === 'in_progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => t.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-number">{tasks.filter(t => t.status === 'overdue').length}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="task-grid">
        {filteredTasks.map(task => (
          <div key={task._id || task.id} className="task-card" onClick={() => setSelectedTask(task)}>
            <div className="task-header">
              <h3>{task.title}</h3>
              <div className="task-badges">
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                  {task.priority.toUpperCase()}
                </span>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <p className="task-description">{task.description}</p>

            <div className="task-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${task.progress}%`, backgroundColor: getStatusColor(task.status) }}
                ></div>
              </div>
              <span className="progress-text">{task.progress}%</span>
            </div>

            <div className="task-details">
              <div className="task-meta">
                <i className="fas fa-calendar"></i>
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
              <div className="task-meta">
                <i className="fas fa-clock"></i>
                <span className={getDaysUntilDue(task.dueDate) < 0 ? 'overdue-text' : 'time-text'}>
                  {getTimeRemaining(task.dueDate)}
                </span>
              </div>
              <div className="task-meta">
                <i className="fas fa-user"></i>
                <span>Assigned by: {task.assignedByName || task.assignedBy}</span>
              </div>
              <div className="task-meta">
                <i className="fas fa-hourglass-half"></i>
                <span>Est. Hours: {task.estimatedHours}h</span>
              </div>
            </div>

            <div className="task-actions">
              {task.status === 'pending' && (
                <button
                  className="btn-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTaskStatus(task._id || task.id, 'in_progress');
                  }}
                >
                  Start Task
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  className="btn-complete"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTaskStatus(task._id || task.id, 'completed');
                  }}
                >
                  Mark Complete
                </button>
              )}
              {task.status === 'completed' && (
                <span className="completed-indicator">
                  <i className="fas fa-check-circle"></i> Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && !loading && (
        <div className="empty-state">
          <i className="fas fa-tasks"></i>
          <h3>No tasks found</h3>
          {/* <p>No tasks match your current filters.</p> */}
        </div>
      )}
    </div>
  );

  const handleDeleteTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tasks/${selectedTask._id || selectedTask.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Filter out the deleted task
      const updatedTasks = tasks.filter(task => (task._id || task.id) !== (selectedTask._id || selectedTask.id));
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      setSelectedTask(null);
      
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const TaskDetails = () => {
    if (!selectedTask) {
      return (
        <div className="no-task-selected">
          <i className="fas fa-arrow-left"></i>
          <h3>Select a task to view details</h3>
          <p>Choose a task from the overview to see detailed information and manage it.</p>
        </div>
      );
    }

    return (
      <div className="task-details-view">
        <div className="task-details-header">
          <button className="back-btn" onClick={() => setSelectedTask(null)}>
            <i className="fas fa-arrow-left"></i> Back to Overview
          </button>
          <div className="task-title-section">
            <h2>{selectedTask.title}</h2>
            <div className="task-badges">
              <span className="priority-badge" style={{ backgroundColor: getPriorityColor(selectedTask.priority) }}>
                {selectedTask.priority.toUpperCase()}
              </span>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedTask.status) }}>
                {selectedTask.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="task-details-content">
          <div className="task-info-section">
            <h3>Task Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Description:</label>
                <p>{selectedTask.description}</p>
              </div>
              <div className="info-item">
                <label>Assigned By:</label>
                <p>{selectedTask.assignedBy}</p>
              </div>
              <div className="info-item">
                <label>Assigned Date:</label>
                <p>{formatDate(selectedTask.assignedDate)}</p>
              </div>
              <div className="info-item">
                <label>Due Date:</label>
                <p>{formatDate(selectedTask.dueDate)}</p>
              </div>
              <div className="info-item">
                <label>Category:</label>
                <p>{selectedTask.category}</p>
              </div>
              <div className="info-item">
                <label>Estimated Hours:</label>
                <p>{selectedTask.estimatedHours} hours</p>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <h3>Progress Tracking</h3>
            <div className="overall-progress">
              <div className="progress-circle">
                <div className="progress-value">{tempProgress}%</div>
              </div>
              <div className="progress-info">
                {/* <h4>Overall Progress</h4>
                <p>Task is {tempProgress}% complete</p> */}
                {hasUnsavedChanges && (
                  <p className="unsaved-indicator">
                    <i className="fas fa-info-circle"></i> Current: {selectedTask.progress}% (Unsaved: {tempProgress}%)
                  </p>
                )}
                <p className="time-remaining">
                  <i className="fas fa-clock"></i> {getTimeRemaining(selectedTask.dueDate)}
                </p>
              </div>
            </div>

            {selectedTask.status !== 'completed' && (
              <div className="progress-update-section">
                <h4>Update Progress</h4>
                <div className="progress-controls">
                  <div className="progress-slider">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={tempProgress}
                      onChange={(e) => handleProgressChange(e.target.value)}
                      className="slider"
                    />
                    <div className="slider-labels">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="progress-input-group">
                    <label>Set Progress:</label>
                    <div className="input-with-button">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={tempProgress}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          handleProgressChange(value);
                        }}
                        className="progress-number-input"
                        placeholder="0-100"
                      />
                      <span className="percent-symbol">%</span>
                    </div>
                    <div className="quick-progress-buttons">
                      <button onClick={() => handleProgressChange(25)} className="quick-btn">25%</button>
                      <button onClick={() => handleProgressChange(50)} className="quick-btn">50%</button>
                      <button onClick={() => handleProgressChange(75)} className="quick-btn">75%</button>
                      <button onClick={() => handleProgressChange(100)} className="quick-btn">100%</button>
                    </div>
                  </div>
                </div>

                {hasUnsavedChanges && (
                  <div className="unsaved-changes-notice">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>You have unsaved changes</span>
                  </div>
                )}

                <div className="action-buttons-row">
                  <button
                    className="btn-save-progress"
                    onClick={saveProgressChanges}
                    disabled={!hasUnsavedChanges}
                  >
                    <i className="fas fa-save"></i> Save Changes
                  </button>

                  {selectedTask.status === 'pending' && (
                    <button
                      className="btn-action btn-start"
                      onClick={() => updateTaskStatus(selectedTask._id || selectedTask.id, 'in_progress')}
                    >
                      <i className="fas fa-play"></i> Start Task
                    </button>
                  )}
                  {selectedTask.status === 'in_progress' && (
                    <button
                      className="btn-action btn-complete"
                      onClick={() => updateTaskStatus(selectedTask._id || selectedTask.id, 'completed')}
                    >
                      <i className="fas fa-check"></i> Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="milestones">
              <h4>Milestones</h4>
              {selectedTask.milestones.map(milestone => (
                <div key={milestone.id} className={`milestone ${milestone.completed ? 'completed' : 'pending'}`}>
                  <div className="milestone-indicator">
                    {milestone.completed ? <i className="fas fa-check-circle"></i> : <i className="far fa-circle"></i>}
                  </div>
                  <div className="milestone-content">
                    <h5>{milestone.title}</h5>
                    <p>Due: {formatDate(milestone.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="comments-section">
            <h3>Comments & Updates</h3>
            <div className="comments-list">
              {selectedTask.comments.map(comment => (
                <div key={comment.id} className={`comment ${comment.type}`}>
                  <div className="comment-header">
                    <div className="comment-author">
                      <strong>{comment.author}</strong>
                      <span className="comment-role">({comment.role})</span>
                    </div>
                    <div className="comment-time">
                      {new Date(comment.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="comment-message">{comment.message}</div>
                </div>
              ))}
            </div>

            <div className="add-comment">
              <textarea
                placeholder="Add a comment or update..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (e.target.value.trim()) {
                      addComment(selectedTask._id || selectedTask.id, e.target.value.trim());
                      e.target.value = '';
                    }
                  }
                }}
              ></textarea>
              <button className="add-comment-btn">
                <i className="fas fa-paper-plane"></i> Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <EmployerSideBar />
        <div className="assigned-tasks-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading your tasks...</h3>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <EmployerSideBar />
      <div className="assigned-tasks-container">
        <div className="assigned-tasks-header">
          <h1>My Assigned Tasks</h1>
          <p>Manage and track your assigned tasks from HR and Admin</p>
        </div>

        <div className="assigned-tasks-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-th-large"></i>
            Task Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <i className="fas fa-info-circle"></i>
            Task Details
          </button>
        </div>

        <div className="assigned-tasks-content">
          {activeTab === 'overview' && <TaskOverview />}
          {activeTab === 'details' && <TaskDetails />}
        </div>
      </div>
    </>
  );
};

export default AssignedTasks;
