import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './TaskAssignment.css';

const TaskAssignment = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'daily',
    dueDate: '',
    estimatedHours: '',
    category: 'development',
    milestones: []
  });
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '', description: '' });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({ active: 0, overdue: 0, completedToday: 0 });

  // Fetch employees from backend
  useEffect(() => {
    fetchEmployees();
    fetchRecentTasks();
    fetchStats();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks/employees/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      console.log('Fetched employees:', data.employees);
      setEmployees(data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks/assigned-by-me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent tasks');
      }

      const data = await response.json();
      // Get only the 5 most recent tasks
      setRecentTasks(data.tasks.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      const tasks = data.tasks;
      
      const today = new Date().toDateString();
      setStats({
        active: tasks.filter(t => t.status === 'in_progress' || t.status === 'pending').length,
        overdue: tasks.filter(t => t.status === 'overdue').length,
        completedToday: tasks.filter(t => 
          t.status === 'completed' && 
          new Date(t.completedDate).toDateString() === today
        ).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.dueDate) {
      setTaskForm(prev => ({
        ...prev,
        milestones: [...prev.milestones, { ...newMilestone, id: Date.now() }]
      }));
      setNewMilestone({ title: '', dueDate: '', description: '' });
      setShowMilestoneModal(false);
    }
  };

  const removeMilestone = (id) => {
    setTaskForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare task data
      const taskData = {
        employeeId: selectedEmployee,
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        taskType: taskForm.type,
        category: taskForm.category,
        dueDate: taskForm.dueDate,
        estimatedHours: parseFloat(taskForm.estimatedHours) || 0,
        milestones: taskForm.milestones.map(m => ({
          title: m.title,
          dueDate: m.dueDate,
          completed: false
        })),
        notes: ''
      };

      const response = await fetch('http://localhost:5000/api/tasks/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign task');
      }

      // Success
      setSuccess('Task assigned successfully!');
      
      // Reset form
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        type: 'daily',
        dueDate: '',
        estimatedHours: '',
        category: 'development',
        milestones: []
      });
      setSelectedEmployee('');

      // Refresh recent tasks and stats
      fetchRecentTasks();
      fetchStats();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error assigning task:', error);
      setError(error.message || 'Failed to assign task');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="task-assignment">
      <div className="assignment-grid">
        {/* Task Creation Form */}
        <div className="task-form-section">
          <div className="section-header">
            <h2>📋 Assign New Tasks</h2>
            {/* <p>Assign tasks to employees with deadlines and milestones</p> */}
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✓ {success}</span>
              <button onClick={() => setSuccess(null)}>✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-row">
              <div className="form-group">
                <label>Select Employee</label>
                <select 
                  value={selectedEmployee} 
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                >
                  <option value="">Choose an employee...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.username} {emp.department ? `- ${emp.department}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Task Type</label>
                <select name="type" value={taskForm.type} onChange={handleInputChange}>
                  <option value="daily">Daily Task</option>
                  <option value="weekly">Weekly Task</option>
                  <option value="monthly">Monthly Task</option>
                  <option value="project-based">Project-Based Task</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                name="title"
                value={taskForm.title}
                onChange={handleInputChange}
                placeholder="Enter task title..."
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={taskForm.description}
                onChange={handleInputChange}
                placeholder="Describe the task in detail..."
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={taskForm.priority} onChange={handleInputChange}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" value={taskForm.category} onChange={handleInputChange}>
                  <option value="development">Development</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="admin">Administrative</option>
                  <option value="support">Support</option>
                  <option value="design">Design</option>
                  <option value="reporting">Reporting</option>
                  <option value="documentation">Documentation</option>
                  <option value="training">Training</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={taskForm.estimatedHours}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            {/* Milestones Section */}
            <div className="milestones-section">
              <div className="milestones-header">
                <label>Task Milestones</label>
                <button 
                  type="button" 
                  className="add-milestone-btn"
                  onClick={() => setShowMilestoneModal(true)}
                >
                  + Add Milestone
                </button>
              </div>

              {taskForm.milestones.length > 0 && (
                <div className="milestones-list">
                  {taskForm.milestones.map(milestone => (
                    <div key={milestone.id} className="milestone-item">
                      <div className="milestone-info">
                        <h4>{milestone.title}</h4>
                        <p>Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                        {milestone.description && <p className="milestone-desc">{milestone.description}</p>}
                      </div>
                      <button 
                        type="button"
                        className="remove-milestone"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '⏳ Assigning...' : '📋 Assign Task'}
            </button>
          </form>
        </div>

        {/* Recent Tasks & Quick Stats */}
        <div className="sidebar-section">
          {/* Quick Stats */}
          <div className="quick-stats">
            <h3>📊 Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.active}</div>
                <div className="stat-label">Active Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.overdue}</div>
                <div className="stat-label">Overdue</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.completedToday}</div>
                <div className="stat-label">Completed Today</div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="recent-tasks">
            <h3>📝 Recent Assignments</h3>
            <div className="tasks-list">
              {recentTasks.length > 0 ? (
                recentTasks.map(task => (
                  <div key={task._id} className="task-item">
                    <div className="task-info">
                      <h4>{task.title}</h4>
                      <p>{task.employeeName}</p>
                      <p className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div 
                      className="task-status"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-tasks">No recent tasks assigned yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Milestone</h3>
              <button 
                className="close-modal"
                onClick={() => setShowMilestoneModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Milestone Title</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter milestone title..."
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the milestone..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowMilestoneModal(false)}
              >
                Cancel
              </button>
              <button 
                className="add-btn"
                onClick={addMilestone}
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAssignment;
