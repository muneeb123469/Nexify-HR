import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaLightbulb, FaPhoneAlt, FaComments, FaGavel, FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import './HRWellnessManagement.css';
import { Sidebar } from '../dashboard/HRDashboard';
import { AdminSidebar } from '../dashboard/AdminDashboard';
import { useAuth } from '../../context/AuthContext';

const HRWellnessManagement = () => {
    const { user } = useAuth();

    // Determine which sidebar to use based on user role
    const SidebarComponent = user?.role === 'admin' ? AdminSidebar : Sidebar;

    const [activeTab, setActiveTab] = useState('tips');
    const [notification, setNotification] = useState(null);

    // Tips state
    const [tips, setTips] = useState({});
    const [editingTip, setEditingTip] = useState(null);

    // Mental Health Resources state
    const [resources, setResources] = useState([]);
    const [editingResource, setEditingResource] = useState(null);
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [resourceForm, setResourceForm] = useState({
        title: '',
        description: '',
        url: '',
        phoneNumber: '',
        category: 'Helpline',
        isActive: true
    });

    // Employee Feedback state
    const [feedbackList, setFeedbackList] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // Compliance Guidelines state
    const [guidelines, setGuidelines] = useState([]);
    const [editingGuideline, setEditingGuideline] = useState(null);
    const [showGuidelineForm, setShowGuidelineForm] = useState(false);
    const [guidelineForm, setGuidelineForm] = useState({
        title: '',
        content: '',
        category: 'Workplace Safety',
        displayOrder: 0,
        isActive: true
    });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchTips(),
            fetchResources(),
            fetchFeedback(),
            fetchGuidelines()
        ]);
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // ===== TIPS MANAGEMENT =====
    const fetchTips = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/wellness/tips', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const tipsObj = {};
            response.data.forEach(tip => {
                tipsObj[tip.dayOfWeek] = tip.tip;
            });
            setTips(tipsObj);
        } catch (error) {
            console.error('Error fetching tips:', error);
        }
    };

    const handleUpdateTip = async (day, tipText) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/wellness/tips/${day}`,
                { tip: tipText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('success', `Tip for ${day} updated successfully!`);
            setEditingTip(null);
            fetchTips();
        } catch (error) {
            console.error('Error updating tip:', error);
            showNotification('error', 'Failed to update tip');
        }
    };

    // ===== MENTAL HEALTH RESOURCES MANAGEMENT =====
    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/wellness/mental-health-resources/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResources(response.data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const handleSaveResource = async () => {
        try {
            const token = localStorage.getItem('token');
            if (editingResource) {
                await axios.put(
                    `http://localhost:5000/api/wellness/mental-health-resources/${editingResource._id}`,
                    resourceForm,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showNotification('success', 'Resource updated successfully!');
            } else {
                await axios.post(
                    'http://localhost:5000/api/wellness/mental-health-resources',
                    resourceForm,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showNotification('success', 'Resource created successfully!');
            }
            setShowResourceForm(false);
            setEditingResource(null);
            setResourceForm({ title: '', description: '', url: '', phoneNumber: '', category: 'Helpline', isActive: true });
            fetchResources();
        } catch (error) {
            console.error('Error saving resource:', error);
            showNotification('error', 'Failed to save resource');
        }
    };

    const handleDeleteResource = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/wellness/mental-health-resources/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('success', 'Resource deleted successfully!');
            fetchResources();
        } catch (error) {
            console.error('Error deleting resource:', error);
            showNotification('error', 'Failed to delete resource');
        }
    };

    const startEditResource = (resource) => {
        setEditingResource(resource);
        setResourceForm(resource);
        setShowResourceForm(true);
    };

    // ===== EMPLOYEE FEEDBACK MANAGEMENT =====
    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/wellness/feedback', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbackList(response.data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    };

    const handleUpdateFeedbackStatus = async (id, status, notes) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/wellness/feedback/${id}`,
                { status, reviewNotes: notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showNotification('success', 'Feedback status updated!');
            fetchFeedback();
        } catch (error) {
            console.error('Error updating feedback:', error);
            showNotification('error', 'Failed to update feedback');
        }
    };

    // ===== COMPLIANCE GUIDELINES MANAGEMENT =====
    const fetchGuidelines = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/wellness/compliance-guidelines/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuidelines(response.data);
        } catch (error) {
            console.error('Error fetching guidelines:', error);
        }
    };

    const handleSaveGuideline = async () => {
        try {
            const token = localStorage.getItem('token');
            if (editingGuideline) {
                await axios.put(
                    `http://localhost:5000/api/wellness/compliance-guidelines/${editingGuideline._id}`,
                    guidelineForm,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showNotification('success', 'Guideline updated successfully!');
            } else {
                await axios.post(
                    'http://localhost:5000/api/wellness/compliance-guidelines',
                    guidelineForm,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showNotification('success', 'Guideline created successfully!');
            }
            setShowGuidelineForm(false);
            setEditingGuideline(null);
            setGuidelineForm({ title: '', content: '', category: 'Workplace Safety', displayOrder: 0, isActive: true });
            fetchGuidelines();
        } catch (error) {
            console.error('Error saving guideline:', error);
            showNotification('error', 'Failed to save guideline');
        }
    };

    const handleDeleteGuideline = async (id) => {
        if (!window.confirm('Are you sure you want to delete this guideline?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/wellness/compliance-guidelines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('success', 'Guideline deleted successfully!');
            fetchGuidelines();
        } catch (error) {
            console.error('Error deleting guideline:', error);
            showNotification('error', 'Failed to delete guideline');
        }
    };

    const startEditGuideline = (guideline) => {
        setEditingGuideline(guideline);
        setGuidelineForm(guideline);
        setShowGuidelineForm(true);
    };

    return (
        <>
            <SidebarComponent />
            <div className="hr-wellness-management">
                <div className="management-header">
                    <h1>Wellness & Compliance Management</h1>
                    <p>Manage employee wellness resources, tips, and compliance guidelines</p>
                </div>

                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                <div className="management-tabs">
                    <button
                        className={activeTab === 'tips' ? 'active' : ''}
                        onClick={() => setActiveTab('tips')}
                    >
                        <FaLightbulb /> Daily Tips
                    </button>
                    <button
                        className={activeTab === 'resources' ? 'active' : ''}
                        onClick={() => setActiveTab('resources')}
                    >
                        <FaPhoneAlt /> Mental Health Resources
                    </button>
                    <button
                        className={activeTab === 'feedback' ? 'active' : ''}
                        onClick={() => setActiveTab('feedback')}
                    >
                        <FaComments /> Employee Feedback
                    </button>
                    <button
                        className={activeTab === 'guidelines' ? 'active' : ''}
                        onClick={() => setActiveTab('guidelines')}
                    >
                        <FaGavel /> Compliance Guidelines
                    </button>
                </div>

                <div className="management-content">
                    {/* TIPS MANAGEMENT TAB */}
                    {activeTab === 'tips' && (
                        <div className="tips-management">
                            <h2>Daily Well-being Tips Management</h2>
                            <p className="section-description">Update wellness tips for each day of the week</p>
                            <div className="tips-list">
                                {daysOfWeek.map(day => (
                                    <div key={day} className="tip-item">
                                        <div className="tip-day-label">{day}</div>
                                        {editingTip === day ? (
                                            <div className="tip-edit-form">
                                                <textarea
                                                    value={tips[day] || ''}
                                                    onChange={(e) => setTips({ ...tips, [day]: e.target.value })}
                                                    placeholder={`Enter tip for ${day}...`}
                                                    rows="3"
                                                />
                                                <div className="tip-actions">
                                                    <button
                                                        className="save-btn"
                                                        onClick={() => handleUpdateTip(day, tips[day])}
                                                    >
                                                        <FaSave /> Save
                                                    </button>
                                                    <button
                                                        className="cancel-btn"
                                                        onClick={() => setEditingTip(null)}
                                                    >
                                                        <FaTimes /> Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="tip-display">
                                                <p>{tips[day] || 'No tip set for this day'}</p>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => setEditingTip(day)}
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MENTAL HEALTH RESOURCES TAB */}
                    {activeTab === 'resources' && (
                        <div className="resources-management">
                            <div className="section-header">
                                <h2>Mental Health Resources Management</h2>
                                <button
                                    className="add-btn"
                                    onClick={() => {
                                        setShowResourceForm(true);
                                        setEditingResource(null);
                                        setResourceForm({ title: '', description: '', url: '', phoneNumber: '', category: 'Helpline', isActive: true });
                                    }}
                                >
                                    <FaPlus /> Add New Resource
                                </button>
                            </div>

                            {showResourceForm && (
                                <div className="resource-form">
                                    <h3>{editingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Title *</label>
                                            <input
                                                type="text"
                                                value={resourceForm.title}
                                                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                                                placeholder="Resource title"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select
                                                value={resourceForm.category}
                                                onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                                            >
                                                <option value="Helpline">Helpline</option>
                                                <option value="Therapy">Therapy</option>
                                                <option value="Crisis Support">Crisis Support</option>
                                                <option value="Self-Help">Self-Help</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Description *</label>
                                            <textarea
                                                value={resourceForm.description}
                                                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                                                placeholder="Resource description"
                                                rows="3"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="text"
                                                value={resourceForm.phoneNumber}
                                                onChange={(e) => setResourceForm({ ...resourceForm, phoneNumber: e.target.value })}
                                                placeholder="Contact number"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Website URL</label>
                                            <input
                                                type="url"
                                                value={resourceForm.url}
                                                onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={resourceForm.isActive}
                                                    onChange={(e) => setResourceForm({ ...resourceForm, isActive: e.target.checked })}
                                                />
                                                <span>Active (visible to employees)</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button className="save-btn" onClick={handleSaveResource}>
                                            <FaSave /> Save Resource
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => {
                                                setShowResourceForm(false);
                                                setEditingResource(null);
                                            }}
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="resources-list">
                                {resources.map(resource => (
                                    <div key={resource._id} className="resource-item">
                                        <div className="resource-header">
                                            <div>
                                                <h3>{resource.title}</h3>
                                                <span className={`badge ${resource.category.toLowerCase()}`}>
                                                    {resource.category}
                                                </span>
                                                <span className={`status-badge ${resource.isActive ? 'active' : 'inactive'}`}>
                                                    {resource.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="resource-actions">
                                                <button className="edit-btn" onClick={() => startEditResource(resource)}>
                                                    <FaEdit /> Edit
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDeleteResource(resource._id)}>
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p>{resource.description}</p>
                                        {resource.phoneNumber && <p><strong>Phone:</strong> {resource.phoneNumber}</p>}
                                        {resource.url && <p><strong>URL:</strong> <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a></p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* EMPLOYEE FEEDBACK TAB */}
                    {activeTab === 'feedback' && (
                        <div className="feedback-management">
                            <h2>Employee Feedback Management</h2>
                            <p className="section-description">Review and respond to employee wellness feedback</p>
                            <div className="feedback-list">
                                {feedbackList.map(feedback => (
                                    <div key={feedback._id} className="feedback-item">
                                        <div className="feedback-header">
                                            <div>
                                                <strong>{feedback.isAnonymous ? 'Anonymous' : feedback.employeeName}</strong>
                                                <span className="feedback-date">
                                                    {new Date(feedback.submittedAt).toLocaleDateString()}
                                                </span>
                                                <span className={`badge ${feedback.category.toLowerCase().replace(/ /g, '-')}`}>
                                                    {feedback.category}
                                                </span>
                                            </div>
                                            <select
                                                value={feedback.status}
                                                onChange={(e) => handleUpdateFeedbackStatus(feedback._id, e.target.value, feedback.reviewNotes)}
                                                className="status-dropdown"
                                            >
                                                <option value="New">New</option>
                                                <option value="Reviewed">Reviewed</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </div>
                                        <p className="feedback-text">{feedback.feedback}</p>
                                        {feedback.reviewNotes && (
                                            <div className="review-notes">
                                                <strong>Review Notes:</strong> {feedback.reviewNotes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {feedbackList.length === 0 && (
                                    <p className="no-data">No employee feedback submitted yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* COMPLIANCE GUIDELINES TAB */}
                    {activeTab === 'guidelines' && (
                        <div className="guidelines-management">
                            <div className="section-header">
                                <h2>Compliance Guidelines Management</h2>
                                <button
                                    className="add-btn"
                                    onClick={() => {
                                        setShowGuidelineForm(true);
                                        setEditingGuideline(null);
                                        setGuidelineForm({ title: '', content: '', category: 'Workplace Safety', displayOrder: 0, isActive: true });
                                    }}
                                >
                                    <FaPlus /> Add New Guideline
                                </button>
                            </div>

                            {showGuidelineForm && (
                                <div className="guideline-form">
                                    <h3>{editingGuideline ? 'Edit Guideline' : 'Add New Guideline'}</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Title *</label>
                                            <input
                                                type="text"
                                                value={guidelineForm.title}
                                                onChange={(e) => setGuidelineForm({ ...guidelineForm, title: e.target.value })}
                                                placeholder="Guideline title"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select
                                                value={guidelineForm.category}
                                                onChange={(e) => setGuidelineForm({ ...guidelineForm, category: e.target.value })}
                                            >
                                                <option value="Workplace Safety">Workplace Safety</option>
                                                <option value="Anti-Discrimination">Anti-Discrimination</option>
                                                <option value="Harassment Policy">Harassment Policy</option>
                                                <option value="General Compliance">General Compliance</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Content *</label>
                                            <textarea
                                                value={guidelineForm.content}
                                                onChange={(e) => setGuidelineForm({ ...guidelineForm, content: e.target.value })}
                                                placeholder="Guideline content (use **text** for bold, - for bullet points)"
                                                rows="10"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Display Order</label>
                                            <input
                                                type="number"
                                                value={guidelineForm.displayOrder}
                                                onChange={(e) => setGuidelineForm({ ...guidelineForm, displayOrder: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={guidelineForm.isActive}
                                                    onChange={(e) => setGuidelineForm({ ...guidelineForm, isActive: e.target.checked })}
                                                />
                                                <span>Active (visible to employees)</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button className="save-btn" onClick={handleSaveGuideline}>
                                            <FaSave /> Save Guideline
                                        </button>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => {
                                                setShowGuidelineForm(false);
                                                setEditingGuideline(null);
                                            }}
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="guidelines-list">
                                {guidelines.map(guideline => (
                                    <div key={guideline._id} className="guideline-item">
                                        <div className="guideline-header">
                                            <div>
                                                <h3>{guideline.title}</h3>
                                                <span className={`badge ${guideline.category.toLowerCase().replace(/ /g, '-')}`}>
                                                    {guideline.category}
                                                </span>
                                                <span className={`status-badge ${guideline.isActive ? 'active' : 'inactive'}`}>
                                                    {guideline.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className="order-badge">Order: {guideline.displayOrder}</span>
                                            </div>
                                            <div className="guideline-actions">
                                                <button className="edit-btn" onClick={() => startEditGuideline(guideline)}>
                                                    <FaEdit /> Edit
                                                </button>
                                                <button className="delete-btn" onClick={() => handleDeleteGuideline(guideline._id)}>
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p className="guideline-preview">{guideline.content.substring(0, 200)}...</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </>
    );
};

export default HRWellnessManagement;
