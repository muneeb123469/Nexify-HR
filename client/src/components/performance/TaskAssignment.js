import React, { useState, useEffect } from 'react';
import './TaskAssignment.css';

const TaskAssignment = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'daily',
    dueDate: '',
    estimatedHours: '',
    category: 'general',
    milestones: []
  });
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '', description: '' });
  const [recentTasks, setRecentTasks] = useState([]);

  // Mock employee data - will be replaced with API call
  useEffect(() => {
    setEmployees([
      { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering' },
      { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing' },
      { id: 3, name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales' },
      { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', department: 'HR' }
    ]);

    // Mock recent tasks
    setRecentTasks([
      { id: 1, title: 'Complete Q4 Report', employee: 'John Doe', dueDate: '2024-01-15', status: 'pending' },
      { id: 2, title: 'Update Marketing Campaign', employee: 'Jane Smith', dueDate: '2024-01-12', status: 'in-progress' },
      { id: 3, title: 'Client Follow-up', employee: 'Mike Johnson', dueDate: '2024-01-10', status: 'completed' }
    ]);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API call to create task
    console.log('Creating task:', { ...taskForm, employeeId: selectedEmployee });
    
    // Reset form
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      type: 'daily',
      dueDate: '',
      estimatedHours: '',
      category: 'general',
      milestones: []
    });
    setSelectedEmployee('');
    
    alert('Task assigned successfully!');
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
            <h2>📋 Create New Task</h2>
            <p>Assign tasks to employees with deadlines and milestones</p>
          </div>

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
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
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
                  <option value="project">Project Task</option>
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
                  <option value="general">General</option>
                  <option value="development">Development</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="support">Support</option>
                  <option value="admin">Administrative</option>
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

            <button type="submit" className="submit-btn">
              📋 Assign Task
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
                <div className="stat-number">24</div>
                <div className="stat-label">Active Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">8</div>
                <div className="stat-label">Overdue</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">16</div>
                <div className="stat-label">Completed Today</div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="recent-tasks">
            <h3>📝 Recent Assignments</h3>
            <div className="tasks-list">
              {recentTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.employee}</p>
                    <p className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div 
                    className="task-status"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status}
                  </div>
                </div>
              ))}
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
