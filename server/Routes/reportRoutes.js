const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { auth: verifyToken } = require('../middleware/auth');
const pdfService = require('../services/pdfService');

// Middleware to check if user is HR or Admin
const isHROrAdmin = (req, res, next) => {
  if (req.user.role !== 'hr' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. HR or Admin role required.' });
  }
  next();
};

// Helper function to calculate performance score for an employee
const calculatePerformanceScore = (tasks) => {
  if (tasks.length === 0) return 0;

  let score = 0;
  const weights = {
    completionRate: 0.4,
    onTimeCompletion: 0.3,
    taskQuality: 0.2,
    taskVolume: 0.1
  };

  // Completion Rate (40%)
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = (completedTasks / tasks.length) * 100;
  score += (completionRate * weights.completionRate);

  // On-Time Completion (30%)
  const completedOnTime = tasks.filter(t => 
    t.status === 'completed' && 
    t.completedDate && 
    new Date(t.completedDate) <= new Date(t.dueDate)
  ).length;
  const onTimeRate = completedTasks > 0 ? (completedOnTime / completedTasks) * 100 : 0;
  score += (onTimeRate * weights.onTimeCompletion);

  // Task Quality (based on progress and milestones) (20%)
  const avgProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length;
  score += (avgProgress * weights.taskQuality);

  // Task Volume (10%)
  const volumeScore = Math.min((tasks.length / 10) * 100, 100); // Normalize to max 10 tasks
  score += (volumeScore * weights.taskVolume);

  return Math.round(score);
};

// Helper function to get days until due date
const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// @route   GET /api/reports/executive-summary
// @desc    Get Executive Summary data (Performance Overview & Risk Areas)
// @access  Private (HR/Admin)
router.get('/executive-summary', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    // Get all employees
    const employees = await User.find({ 
      role: 'employee',
      status: 'Active'
    }).select('_id username email department');

    // Get all active tasks
    const allTasks = await Task.find({ isActive: true });

    // Calculate total employees
    const totalEmployees = employees.length;

    // Calculate total tasks
    const totalTasks = allTasks.length;

    // Calculate task completion rate
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate average productivity
    const totalProgress = allTasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    const averageProductivity = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

    // Calculate performance scores for each employee
    const employeePerformances = await Promise.all(
      employees.map(async (employee) => {
        const employeeTasks = allTasks.filter(
          t => t.employeeId.toString() === employee._id.toString()
        );
        const score = calculatePerformanceScore(employeeTasks);
        
        return {
          name: employee.username,
          email: employee.email,
          department: employee.department || 'Not Specified',
          score: score,
          tasksCount: employeeTasks.length,
          completedCount: employeeTasks.filter(t => t.status === 'completed').length
        };
      })
    );

    // Sort by score to get top and low performers
    const sortedPerformances = employeePerformances
      .filter(emp => emp.tasksCount > 0) // Only include employees with tasks
      .sort((a, b) => b.score - a.score);

    // Top 3 performers
    const topPerformers = sortedPerformances.slice(0, 3).map((emp, index) => ({
      name: emp.name,
      score: emp.score,
      department: emp.department
    }));

    // Bottom 3 performers (needs attention)
    const lowPerformers = sortedPerformances.slice(-3).reverse().map((emp, index) => ({
      name: emp.name,
      score: emp.score,
      department: emp.department
    }));

    // Risk Areas - Tasks near due dates (within 3 days)
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    const tasksNearDueDate = allTasks.filter(task => {
      if (task.status === 'completed') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= threeDaysFromNow;
    });

    // Get unique employees with tasks near due dates
    const employeesAtRisk = [];
    const processedEmployees = new Set();

    for (const task of tasksNearDueDate) {
      const empId = task.employeeId.toString();
      if (!processedEmployees.has(empId)) {
        processedEmployees.add(empId);
        const employee = employees.find(e => e._id.toString() === empId);
        if (employee) {
          const empTasks = tasksNearDueDate.filter(
            t => t.employeeId.toString() === empId
          );
          employeesAtRisk.push({
            employeeName: employee.username,
            department: employee.department || 'Not Specified',
            tasksAtRisk: empTasks.length,
            nearestDueDate: empTasks.reduce((nearest, t) => {
              return !nearest || new Date(t.dueDate) < new Date(nearest) 
                ? t.dueDate 
                : nearest;
            }, null)
          });
        }
      }
    }

    // Define risk areas based on data analysis
    const riskAreas = [];

    // Deadline Compliance Risk
    const overdueTasks = allTasks.filter(t => t.status === 'overdue').length;
    const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
    let deadlineRisk = 'Low';
    let deadlineImpact = 'Minor';
    
    if (overdueRate > 20) {
      deadlineRisk = 'High';
      deadlineImpact = 'Critical';
    } else if (overdueRate > 10) {
      deadlineRisk = 'Medium';
      deadlineImpact = 'Moderate';
    }

    riskAreas.push({
      area: 'Deadline Compliance',
      risk: deadlineRisk,
      impact: deadlineImpact,
      details: `${overdueTasks} overdue tasks (${Math.round(overdueRate)}%)`
    });

    // Task Overload Risk
    const tasksPerEmployee = totalTasks / (totalEmployees || 1);
    let overloadRisk = 'Low';
    let overloadImpact = 'Minor';
    
    if (tasksPerEmployee > 10) {
      overloadRisk = 'High';
      overloadImpact = 'Critical';
    } else if (tasksPerEmployee > 6) {
      overloadRisk = 'Medium';
      overloadImpact = 'Moderate';
    }

    riskAreas.push({
      area: 'Task Overload',
      risk: overloadRisk,
      impact: overloadImpact,
      details: `Average ${Math.round(tasksPerEmployee)} tasks per employee`
    });

    // Resource Allocation Risk
    const employeesWithNoTasks = employees.length - sortedPerformances.length;
    const allocationRate = employees.length > 0 
      ? (employeesWithNoTasks / employees.length) * 100 
      : 0;
    let allocationRisk = 'Low';
    let allocationImpact = 'Minor';
    
    if (allocationRate > 30) {
      allocationRisk = 'High';
      allocationImpact = 'Moderate';
    } else if (allocationRate > 15) {
      allocationRisk = 'Medium';
      allocationImpact = 'Minor';
    }

    riskAreas.push({
      area: 'Resource Allocation',
      risk: allocationRisk,
      impact: allocationImpact,
      details: `${employeesWithNoTasks} employees with no assigned tasks`
    });

    // Prepare response
    const executiveSummary = {
      totalEmployees,
      activeTasks: totalTasks,
      completionRate,
      averageProductivity,
      topPerformers,
      lowPerformers,
      riskAreas,
      employeesAtRisk: employeesAtRisk.slice(0, 5) // Top 5 employees at risk
    };

    res.json(executiveSummary);
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    res.status(500).json({ 
      message: 'Error fetching executive summary', 
      error: error.message 
    });
  }
});

// @route   GET /api/reports/productivity-analysis
// @desc    Get Productivity Analysis data (Trends, Department Comparison, Task Categories)
// @access  Private (HR/Admin)
router.get('/productivity-analysis', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    // Get all active tasks
    const allTasks = await Task.find({ isActive: true });

    // ===== PRODUCTIVITY TRENDS (Weekly) =====
    const now = new Date();
    const trends = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
      weekEnd.setHours(23, 59, 59, 999);

      // Get tasks completed in this week
      const weekTasks = allTasks.filter(task => {
        const completedDate = task.completedDate ? new Date(task.completedDate) : null;
        return completedDate && completedDate >= weekStart && completedDate <= weekEnd;
      });

      // Get tasks that were active (assigned or in progress) during this week
      const activeTasks = allTasks.filter(task => {
        const assignedDate = new Date(task.assignedDate);
        return assignedDate <= weekEnd;
      });

      // Calculate productivity score for the week
      let productivityScore = 0;
      
      if (activeTasks.length > 0) {
        const completionRate = (weekTasks.length / activeTasks.length) * 100;
        const onTimeCompletions = weekTasks.filter(t => 
          new Date(t.completedDate) <= new Date(t.dueDate)
        ).length;
        const onTimeRate = weekTasks.length > 0 
          ? (onTimeCompletions / weekTasks.length) * 100 
          : 0;
        
        // Weighted score: 60% completion rate, 40% on-time rate
        productivityScore = Math.round((completionRate * 0.6) + (onTimeRate * 0.4));
      }

      const weekNumber = 4 - i;
      trends.push({
        period: `Week ${weekNumber}`,
        score: Math.min(productivityScore, 100), // Cap at 100
        completedTasks: weekTasks.length,
        activeTasks: activeTasks.length
      });
    }

    // ===== DEPARTMENT COMPARISON =====
    const departments = [...new Set(allTasks.map(t => t.employeeDepartment))];
    const departmentComparison = [];

    for (const dept of departments) {
      const deptTasks = allTasks.filter(t => t.employeeDepartment === dept);
      
      if (deptTasks.length === 0) continue;

      // Current period (last 30 days)
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const currentPeriodTasks = deptTasks.filter(t => 
        new Date(t.assignedDate) >= thirtyDaysAgo
      );

      // Previous period (30-60 days ago)
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(now.getDate() - 60);
      
      const previousPeriodTasks = deptTasks.filter(t => {
        const assignedDate = new Date(t.assignedDate);
        return assignedDate >= sixtyDaysAgo && assignedDate < thirtyDaysAgo;
      });

      // Calculate current productivity
      const currentCompleted = currentPeriodTasks.filter(t => t.status === 'completed').length;
      const currentOnTime = currentPeriodTasks.filter(t => 
        t.status === 'completed' && 
        t.completedDate && 
        new Date(t.completedDate) <= new Date(t.dueDate)
      ).length;
      
      const currentProductivity = currentPeriodTasks.length > 0
        ? Math.round(((currentCompleted * 0.5) + (currentOnTime * 0.5)) / currentPeriodTasks.length * 100)
        : 0;

      // Calculate previous productivity
      const previousCompleted = previousPeriodTasks.filter(t => t.status === 'completed').length;
      const previousOnTime = previousPeriodTasks.filter(t => 
        t.status === 'completed' && 
        t.completedDate && 
        new Date(t.completedDate) <= new Date(t.dueDate)
      ).length;
      
      const previousProductivity = previousPeriodTasks.length > 0
        ? Math.round(((previousCompleted * 0.5) + (previousOnTime * 0.5)) / previousPeriodTasks.length * 100)
        : 0;

      const change = currentProductivity - previousProductivity;

      departmentComparison.push({
        department: dept,
        current: currentProductivity,
        previous: previousProductivity,
        change: change,
        tasksCount: currentPeriodTasks.length
      });
    }

    // Sort by current productivity
    departmentComparison.sort((a, b) => b.current - a.current);

    // ===== TASK CATEGORIES ANALYSIS =====
    const categories = [...new Set(allTasks.map(t => t.category))];
    const taskCategories = [];

    for (const category of categories) {
      const categoryTasks = allTasks.filter(t => t.category === category);
      
      const completed = categoryTasks.filter(t => t.status === 'completed').length;
      const pending = categoryTasks.filter(t => 
        t.status === 'pending' || t.status === 'in_progress'
      ).length;
      const overdue = categoryTasks.filter(t => t.status === 'overdue').length;

      taskCategories.push({
        category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize
        completed,
        pending,
        overdue,
        total: categoryTasks.length
      });
    }

    // Sort by total tasks
    taskCategories.sort((a, b) => b.total - a.total);

    // Prepare response
    const productivityAnalysis = {
      trends,
      departmentComparison,
      taskCategories
    };

    res.json(productivityAnalysis);
  } catch (error) {
    console.error('Error fetching productivity analysis:', error);
    res.status(500).json({ 
      message: 'Error fetching productivity analysis', 
      error: error.message 
    });
  }
});

// @route   GET /api/reports/efficiency-report
// @desc    Get Efficiency Report data
// @access  Private (HR/Admin)
router.get('/efficiency-report', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    // Get all active tasks
    const allTasks = await Task.find({ isActive: true });
    
    // Get all employees
    const employees = await User.find({ 
      role: 'employee',
      status: 'Active'
    });

    if (allTasks.length === 0) {
      return res.json({
        timeUtilization: 0,
        resourceEfficiency: 0,
        processOptimization: 0,
        communicationScore: 0,
        bottlenecks: [],
        improvements: []
      });
    }

    // ===== TIME UTILIZATION =====
    // Calculate based on task completion within estimated hours
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    let timeUtilizationScore = 0;
    
    if (completedTasks.length > 0) {
      const tasksWithEstimates = completedTasks.filter(t => t.estimatedHours > 0);
      if (tasksWithEstimates.length > 0) {
        // Calculate average time efficiency
        const avgEfficiency = tasksWithEstimates.reduce((sum, task) => {
          const assignedDate = new Date(task.assignedDate);
          const completedDate = new Date(task.completedDate);
          const actualHours = (completedDate - assignedDate) / (1000 * 60 * 60);
          const efficiency = Math.min((task.estimatedHours / actualHours) * 100, 100);
          return sum + efficiency;
        }, 0) / tasksWithEstimates.length;
        
        timeUtilizationScore = Math.round(avgEfficiency);
      }
    }

    // ===== RESOURCE EFFICIENCY =====
    // Based on employee utilization and task distribution
    const employeesWithTasks = new Set(allTasks.map(t => t.employeeId.toString())).size;
    const utilizationRate = employees.length > 0 
      ? (employeesWithTasks / employees.length) * 100 
      : 0;
    
    // Calculate task completion rate
    const completionRate = (completedTasks.length / allTasks.length) * 100;
    
    // Resource efficiency = weighted average
    const resourceEfficiency = Math.round((utilizationRate * 0.6) + (completionRate * 0.4));

    // ===== PROCESS OPTIMIZATION =====
    // Based on on-time completion and workflow efficiency
    const onTimeCompletions = completedTasks.filter(t => 
      new Date(t.completedDate) <= new Date(t.dueDate)
    ).length;
    const onTimeRate = completedTasks.length > 0 
      ? (onTimeCompletions / completedTasks.length) * 100 
      : 0;
    
    // Check for tasks with milestones (better process management)
    const tasksWithMilestones = allTasks.filter(t => t.milestones && t.milestones.length > 0).length;
    const milestoneUsageRate = (tasksWithMilestones / allTasks.length) * 100;
    
    const processOptimization = Math.round((onTimeRate * 0.7) + (milestoneUsageRate * 0.3));

    // ===== COMMUNICATION SCORE =====
    // Based on comments and collaboration
    const tasksWithComments = allTasks.filter(t => t.comments && t.comments.length > 0).length;
    const communicationRate = (tasksWithComments / allTasks.length) * 100;
    
    // Average comments per task (more communication = better)
    const totalComments = allTasks.reduce((sum, t) => sum + (t.comments?.length || 0), 0);
    const avgCommentsPerTask = totalComments / allTasks.length;
    const commentScore = Math.min((avgCommentsPerTask / 3) * 100, 100); // Normalize to 3 comments
    
    const communicationScore = Math.round((communicationRate * 0.6) + (commentScore * 0.4));

    // ===== BOTTLENECKS =====
    const bottlenecks = [];
    
    // Bottleneck 1: Task Assignment Delay
    const pendingTasks = allTasks.filter(t => t.status === 'pending');
    const avgPendingDays = pendingTasks.reduce((sum, task) => {
      const daysPending = (new Date() - new Date(task.assignedDate)) / (1000 * 60 * 60 * 24);
      return sum + daysPending;
    }, 0) / (pendingTasks.length || 1);
    
    if (avgPendingDays > 2) {
      bottlenecks.push({
        process: 'Task Assignment to Start',
        delay: `${avgPendingDays.toFixed(1)} days`,
        impact: avgPendingDays > 5 ? 'High' : avgPendingDays > 3 ? 'Medium' : 'Low',
        count: pendingTasks.length
      });
    }

    // Bottleneck 2: Overdue Tasks
    const overdueTasks = allTasks.filter(t => t.status === 'overdue');
    if (overdueTasks.length > 0) {
      const avgOverdueDays = overdueTasks.reduce((sum, task) => {
        const daysOverdue = (new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24);
        return sum + daysOverdue;
      }, 0) / overdueTasks.length;
      
      bottlenecks.push({
        process: 'Deadline Compliance',
        delay: `${avgOverdueDays.toFixed(1)} days overdue`,
        impact: overdueTasks.length > 10 ? 'High' : overdueTasks.length > 5 ? 'Medium' : 'Low',
        count: overdueTasks.length
      });
    }

    // Bottleneck 3: High Priority Tasks Delayed
    const highPriorityDelayed = allTasks.filter(t => 
      t.priority === 'high' && 
      (t.status === 'pending' || t.status === 'overdue')
    );
    
    if (highPriorityDelayed.length > 0) {
      bottlenecks.push({
        process: 'High Priority Task Handling',
        delay: `${highPriorityDelayed.length} tasks delayed`,
        impact: 'High',
        count: highPriorityDelayed.length
      });
    }

    // Bottleneck 4: Task Distribution Imbalance
    const tasksByEmployee = {};
    allTasks.forEach(task => {
      const empId = task.employeeId.toString();
      tasksByEmployee[empId] = (tasksByEmployee[empId] || 0) + 1;
    });
    
    const taskCounts = Object.values(tasksByEmployee);
    if (taskCounts.length > 0) {
      const maxTasks = Math.max(...taskCounts);
      const minTasks = Math.min(...taskCounts);
      const imbalance = maxTasks - minTasks;
      
      if (imbalance > 5) {
        bottlenecks.push({
          process: 'Task Distribution',
          delay: `${imbalance} task difference`,
          impact: imbalance > 10 ? 'High' : 'Medium',
          count: imbalance
        });
      }
    }

    // ===== IMPROVEMENT OPPORTUNITIES =====
    const improvements = [];

    // Improvement 1: Automation potential
    if (timeUtilizationScore < 75) {
      improvements.push({
        area: 'Automated Workflows',
        potential: `${Math.round((75 - timeUtilizationScore) * 0.8)}%`,
        priority: timeUtilizationScore < 60 ? 'High' : 'Medium',
        description: 'Implement task automation to improve time utilization'
      });
    }

    // Improvement 2: Communication enhancement
    if (communicationScore < 80) {
      improvements.push({
        area: 'Team Communication',
        potential: `${Math.round((80 - communicationScore) * 0.6)}%`,
        priority: communicationScore < 65 ? 'High' : 'Medium',
        description: 'Enhance collaboration tools and communication practices'
      });
    }

    // Improvement 3: Process optimization
    if (processOptimization < 85) {
      improvements.push({
        area: 'Process Standardization',
        potential: `${Math.round((85 - processOptimization) * 0.7)}%`,
        priority: processOptimization < 70 ? 'High' : 'Medium',
        description: 'Standardize workflows and implement best practices'
      });
    }

    // Improvement 4: Resource planning
    if (resourceEfficiency < 80) {
      improvements.push({
        area: 'Resource Allocation',
        potential: `${Math.round((80 - resourceEfficiency) * 0.75)}%`,
        priority: resourceEfficiency < 65 ? 'High' : 'Medium',
        description: 'Optimize employee workload distribution'
      });
    }

    // Improvement 5: Milestone usage
    if (milestoneUsageRate < 50) {
      improvements.push({
        area: 'Milestone Planning',
        potential: `${Math.round((50 - milestoneUsageRate) * 0.5)}%`,
        priority: 'Medium',
        description: 'Increase use of milestones for better task tracking'
      });
    }

    // Sort improvements by priority and potential
    improvements.sort((a, b) => {
      if (a.priority === 'High' && b.priority !== 'High') return -1;
      if (a.priority !== 'High' && b.priority === 'High') return 1;
      return parseFloat(b.potential) - parseFloat(a.potential);
    });

    const efficiencyReport = {
      timeUtilization: Math.max(0, Math.min(100, timeUtilizationScore)),
      resourceEfficiency: Math.max(0, Math.min(100, resourceEfficiency)),
      processOptimization: Math.max(0, Math.min(100, processOptimization)),
      communicationScore: Math.max(0, Math.min(100, communicationScore)),
      bottlenecks: bottlenecks.slice(0, 5), // Top 5 bottlenecks
      improvements: improvements.slice(0, 5) // Top 5 improvements
    };

    res.json(efficiencyReport);
  } catch (error) {
    console.error('Error fetching efficiency report:', error);
    res.status(500).json({ 
      message: 'Error fetching efficiency report', 
      error: error.message 
    });
  }
});

// @route   GET /api/reports/compliance-report
// @desc    Get Compliance Report data
// @access  Private (HR/Admin)
router.get('/compliance-report', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    // Get all active tasks
    const allTasks = await Task.find({ isActive: true });

    if (allTasks.length === 0) {
      return res.json({
        deadlineCompliance: 0,
        qualityStandards: 0,
        processAdherence: 0,
        documentationScore: 0,
        violations: [],
        recommendations: []
      });
    }

    // ===== DEADLINE COMPLIANCE =====
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const onTimeCompletions = completedTasks.filter(t => 
      new Date(t.completedDate) <= new Date(t.dueDate)
    ).length;
    
    const deadlineCompliance = completedTasks.length > 0
      ? Math.round((onTimeCompletions / completedTasks.length) * 100)
      : 0;

    // ===== QUALITY STANDARDS =====
    // Based on task completion with milestones and progress
    const tasksWithMilestones = allTasks.filter(t => t.milestones && t.milestones.length > 0);
    const completedMilestones = tasksWithMilestones.reduce((sum, task) => {
      const completed = task.milestones.filter(m => m.completed).length;
      const total = task.milestones.length;
      return sum + (total > 0 ? (completed / total) * 100 : 0);
    }, 0);
    
    const milestoneQuality = tasksWithMilestones.length > 0
      ? completedMilestones / tasksWithMilestones.length
      : 0;
    
    // Average progress of all tasks
    const avgProgress = allTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / allTasks.length;
    
    const qualityStandards = Math.round((milestoneQuality * 0.5) + (avgProgress * 0.5));

    // ===== PROCESS ADHERENCE =====
    // Based on proper task categorization, priority setting, and milestone usage
    const tasksWithCategory = allTasks.filter(t => t.category && t.category !== 'other').length;
    const categorizationRate = (tasksWithCategory / allTasks.length) * 100;
    
    const tasksWithPriority = allTasks.filter(t => t.priority).length;
    const priorityRate = (tasksWithPriority / allTasks.length) * 100;
    
    const milestoneUsageRate = (tasksWithMilestones.length / allTasks.length) * 100;
    
    const processAdherence = Math.round(
      (categorizationRate * 0.3) + 
      (priorityRate * 0.3) + 
      (milestoneUsageRate * 0.4)
    );

    // ===== DOCUMENTATION SCORE =====
    // Based on task descriptions, comments, and attachments
    const tasksWithDescription = allTasks.filter(t => 
      t.description && t.description.length > 20
    ).length;
    const descriptionRate = (tasksWithDescription / allTasks.length) * 100;
    
    const tasksWithComments = allTasks.filter(t => 
      t.comments && t.comments.length > 0
    ).length;
    const commentRate = (tasksWithComments / allTasks.length) * 100;
    
    const tasksWithAttachments = allTasks.filter(t => 
      t.attachments && t.attachments.length > 0
    ).length;
    const attachmentRate = (tasksWithAttachments / allTasks.length) * 100;
    
    const documentationScore = Math.round(
      (descriptionRate * 0.4) + 
      (commentRate * 0.4) + 
      (attachmentRate * 0.2)
    );

    // ===== VIOLATIONS =====
    const violations = [];

    // Violation 1: Missed Deadlines
    const missedDeadlines = completedTasks.filter(t => 
      new Date(t.completedDate) > new Date(t.dueDate)
    ).length;
    
    if (missedDeadlines > 0) {
      violations.push({
        type: 'Missed Deadline',
        count: missedDeadlines,
        severity: missedDeadlines > 10 ? 'High' : missedDeadlines > 5 ? 'Medium' : 'Low',
        percentage: Math.round((missedDeadlines / completedTasks.length) * 100)
      });
    }

    // Violation 2: Overdue Tasks
    const overdueTasks = allTasks.filter(t => t.status === 'overdue').length;
    if (overdueTasks > 0) {
      violations.push({
        type: 'Currently Overdue',
        count: overdueTasks,
        severity: overdueTasks > 15 ? 'High' : overdueTasks > 8 ? 'Medium' : 'Low',
        percentage: Math.round((overdueTasks / allTasks.length) * 100)
      });
    }

    // Violation 3: Incomplete Documentation
    const poorlyDocumented = allTasks.filter(t => 
      !t.description || t.description.length < 20
    ).length;
    
    if (poorlyDocumented > 0) {
      violations.push({
        type: 'Inadequate Documentation',
        count: poorlyDocumented,
        severity: poorlyDocumented > 20 ? 'High' : poorlyDocumented > 10 ? 'Medium' : 'Low',
        percentage: Math.round((poorlyDocumented / allTasks.length) * 100)
      });
    }

    // Violation 4: Process Deviation (no milestones for complex tasks)
    const complexTasksNoMilestones = allTasks.filter(t => 
      t.estimatedHours > 20 && 
      (!t.milestones || t.milestones.length === 0)
    ).length;
    
    if (complexTasksNoMilestones > 0) {
      violations.push({
        type: 'Process Deviation',
        count: complexTasksNoMilestones,
        severity: complexTasksNoMilestones > 5 ? 'Medium' : 'Low',
        percentage: Math.round((complexTasksNoMilestones / allTasks.length) * 100)
      });
    }

    // Violation 5: High Priority Tasks Delayed
    const highPriorityDelayed = allTasks.filter(t => 
      t.priority === 'high' && 
      (t.status === 'overdue' || t.status === 'pending')
    ).length;
    
    if (highPriorityDelayed > 0) {
      violations.push({
        type: 'High Priority Delays',
        count: highPriorityDelayed,
        severity: 'High',
        percentage: Math.round((highPriorityDelayed / allTasks.length) * 100)
      });
    }

    // Sort violations by severity
    violations.sort((a, b) => {
      const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // ===== RECOMMENDATIONS =====
    const recommendations = [];

    if (deadlineCompliance < 85) {
      recommendations.push({
        title: 'Improve Deadline Management',
        description: 'Implement automated deadline reminders and early warning systems',
        priority: 'High',
        impact: 'Reduce missed deadlines by 30-40%'
      });
    }

    if (qualityStandards < 85) {
      recommendations.push({
        title: 'Enhance Quality Control',
        description: 'Establish quality checkpoints and peer review processes',
        priority: 'High',
        impact: 'Improve task quality by 25-35%'
      });
    }

    if (processAdherence < 80) {
      recommendations.push({
        title: 'Standardize Processes',
        description: 'Provide training on task management best practices and workflow standards',
        priority: 'Medium',
        impact: 'Increase process compliance by 20-30%'
      });
    }

    if (documentationScore < 75) {
      recommendations.push({
        title: 'Improve Documentation',
        description: 'Mandate detailed task descriptions and regular progress updates',
        priority: 'Medium',
        impact: 'Better tracking and knowledge retention'
      });
    }

    if (overdueTasks > 5) {
      recommendations.push({
        title: 'Address Overdue Tasks',
        description: 'Conduct immediate review of overdue tasks and reallocate resources',
        priority: 'High',
        impact: 'Clear backlog and prevent bottlenecks'
      });
    }

    if (milestoneUsageRate < 50) {
      recommendations.push({
        title: 'Increase Milestone Usage',
        description: 'Require milestones for all tasks exceeding 10 estimated hours',
        priority: 'Medium',
        impact: 'Better progress tracking and accountability'
      });
    }

    // Sort recommendations by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { 'High': 2, 'Medium': 1, 'Low': 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const complianceReport = {
      deadlineCompliance: Math.max(0, Math.min(100, deadlineCompliance)),
      qualityStandards: Math.max(0, Math.min(100, qualityStandards)),
      processAdherence: Math.max(0, Math.min(100, processAdherence)),
      documentationScore: Math.max(0, Math.min(100, documentationScore)),
      violations: violations.slice(0, 6), // Top 6 violations
      recommendations: recommendations.slice(0, 6) // Top 6 recommendations
    };

    res.json(complianceReport);
  } catch (error) {
    console.error('Error fetching compliance report:', error);
    res.status(500).json({ 
      message: 'Error fetching compliance report', 
      error: error.message 
    });
  }
});

// ===== PDF DOWNLOAD ENDPOINTS =====

// @route   GET /api/reports/download/executive-summary
// @desc    Download Executive Summary as PDF
// @access  Private (HR/Admin)
router.get('/download/executive-summary', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    // Fetch the data
    const employees = await User.find({ 
      role: 'employee',
      status: 'Active'
    }).select('_id username email department');

    const allTasks = await Task.find({ isActive: true });
    const totalEmployees = employees.length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalProgress = allTasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    const averageProductivity = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;

    const employeePerformances = await Promise.all(
      employees.map(async (employee) => {
        const employeeTasks = allTasks.filter(
          t => t.employeeId.toString() === employee._id.toString()
        );
        const score = calculatePerformanceScore(employeeTasks);
        
        return {
          name: employee.username,
          email: employee.email,
          department: employee.department || 'Not Specified',
          score: score,
          tasksCount: employeeTasks.length,
          completedCount: employeeTasks.filter(t => t.status === 'completed').length
        };
      })
    );

    const sortedPerformances = employeePerformances
      .filter(emp => emp.tasksCount > 0)
      .sort((a, b) => b.score - a.score);

    const topPerformers = sortedPerformances.slice(0, 3).map((emp) => ({
      name: emp.name,
      score: emp.score,
      department: emp.department
    }));

    const lowPerformers = sortedPerformances.slice(-3).reverse().map((emp) => ({
      name: emp.name,
      score: emp.score,
      department: emp.department
    }));

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    const tasksNearDueDate = allTasks.filter(task => {
      if (task.status === 'completed') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= threeDaysFromNow;
    });

    const employeesAtRisk = [];
    const processedEmployees = new Set();

    for (const task of tasksNearDueDate) {
      const empId = task.employeeId.toString();
      if (!processedEmployees.has(empId)) {
        processedEmployees.add(empId);
        const employee = employees.find(e => e._id.toString() === empId);
        if (employee) {
          const empTasks = tasksNearDueDate.filter(
            t => t.employeeId.toString() === empId
          );
          employeesAtRisk.push({
            employeeName: employee.username,
            department: employee.department || 'Not Specified',
            tasksAtRisk: empTasks.length
          });
        }
      }
    }

    const riskAreas = [];
    const overdueTasks = allTasks.filter(t => t.status === 'overdue').length;
    const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
    let deadlineRisk = 'Low';
    let deadlineImpact = 'Minor';
    
    if (overdueRate > 20) {
      deadlineRisk = 'High';
      deadlineImpact = 'Critical';
    } else if (overdueRate > 10) {
      deadlineRisk = 'Medium';
      deadlineImpact = 'Moderate';
    }

    riskAreas.push({
      area: 'Deadline Compliance',
      risk: deadlineRisk,
      impact: deadlineImpact
    });

    const tasksPerEmployee = totalTasks / (totalEmployees || 1);
    let overloadRisk = 'Low';
    let overloadImpact = 'Minor';
    
    if (tasksPerEmployee > 10) {
      overloadRisk = 'High';
      overloadImpact = 'Critical';
    } else if (tasksPerEmployee > 6) {
      overloadRisk = 'Medium';
      overloadImpact = 'Moderate';
    }

    riskAreas.push({
      area: 'Task Overload',
      risk: overloadRisk,
      impact: overloadImpact
    });

    const data = {
      totalEmployees,
      activeTasks: totalTasks,
      completionRate,
      averageProductivity,
      topPerformers,
      lowPerformers,
      riskAreas,
      employeesAtRisk: employeesAtRisk.slice(0, 5)
    };

    // Generate PDF
    const doc = pdfService.generateExecutiveSummary(data);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=executive-summary-${Date.now()}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating executive summary PDF:', error);
    res.status(500).json({ 
      message: 'Error generating PDF', 
      error: error.message 
    });
  }
});

// @route   GET /api/reports/download/productivity-analysis
// @desc    Download Productivity Analysis as PDF
// @access  Private (HR/Admin)
router.get('/download/productivity-analysis', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    const allTasks = await Task.find({ isActive: true });
    const now = new Date();
    const trends = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekTasks = allTasks.filter(task => {
        const completedDate = task.completedDate ? new Date(task.completedDate) : null;
        return completedDate && completedDate >= weekStart && completedDate <= weekEnd;
      });

      const activeTasks = allTasks.filter(task => {
        const assignedDate = new Date(task.assignedDate);
        return assignedDate <= weekEnd;
      });

      let productivityScore = 0;
      
      if (activeTasks.length > 0) {
        const completionRate = (weekTasks.length / activeTasks.length) * 100;
        const onTimeCompletions = weekTasks.filter(t => 
          new Date(t.completedDate) <= new Date(t.dueDate)
        ).length;
        const onTimeRate = weekTasks.length > 0 
          ? (onTimeCompletions / weekTasks.length) * 100 
          : 0;
        
        productivityScore = Math.round((completionRate * 0.6) + (onTimeRate * 0.4));
      }

      const weekNumber = 4 - i;
      trends.push({
        period: `Week ${weekNumber}`,
        score: Math.min(productivityScore, 100),
        completedTasks: weekTasks.length,
        activeTasks: activeTasks.length
      });
    }

    const departments = [...new Set(allTasks.map(t => t.employeeDepartment))];
    const departmentComparison = [];

    for (const dept of departments) {
      const deptTasks = allTasks.filter(t => t.employeeDepartment === dept);
      
      if (deptTasks.length === 0) continue;

      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const currentPeriodTasks = deptTasks.filter(t => 
        new Date(t.assignedDate) >= thirtyDaysAgo
      );

      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(now.getDate() - 60);
      
      const previousPeriodTasks = deptTasks.filter(t => {
        const assignedDate = new Date(t.assignedDate);
        return assignedDate >= sixtyDaysAgo && assignedDate < thirtyDaysAgo;
      });

      const currentCompleted = currentPeriodTasks.filter(t => t.status === 'completed').length;
      const currentOnTime = currentPeriodTasks.filter(t => 
        t.status === 'completed' && 
        t.completedDate && 
        new Date(t.completedDate) <= new Date(t.dueDate)
      ).length;
      
      const currentProductivity = currentPeriodTasks.length > 0
        ? Math.round(((currentCompleted * 0.5) + (currentOnTime * 0.5)) / currentPeriodTasks.length * 100)
        : 0;

      const previousCompleted = previousPeriodTasks.filter(t => t.status === 'completed').length;
      const previousOnTime = previousPeriodTasks.filter(t => 
        t.status === 'completed' && 
        t.completedDate && 
        new Date(t.completedDate) <= new Date(t.dueDate)
      ).length;
      
      const previousProductivity = previousPeriodTasks.length > 0
        ? Math.round(((previousCompleted * 0.5) + (previousOnTime * 0.5)) / previousPeriodTasks.length * 100)
        : 0;

      const change = currentProductivity - previousProductivity;

      departmentComparison.push({
        department: dept,
        current: currentProductivity,
        previous: previousProductivity,
        change: change,
        tasksCount: currentPeriodTasks.length
      });
    }

    departmentComparison.sort((a, b) => b.current - a.current);

    const categories = [...new Set(allTasks.map(t => t.category))];
    const taskCategories = [];

    for (const category of categories) {
      const categoryTasks = allTasks.filter(t => t.category === category);
      
      const completed = categoryTasks.filter(t => t.status === 'completed').length;
      const pending = categoryTasks.filter(t => 
        t.status === 'pending' || t.status === 'in_progress'
      ).length;
      const overdue = categoryTasks.filter(t => t.status === 'overdue').length;

      taskCategories.push({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        completed,
        pending,
        overdue,
        total: categoryTasks.length
      });
    }

    taskCategories.sort((a, b) => b.total - a.total);

    const data = {
      trends,
      departmentComparison,
      taskCategories
    };

    // Generate PDF
    const doc = pdfService.generateProductivityAnalysis(data);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=productivity-analysis-${Date.now()}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating productivity analysis PDF:', error);
    res.status(500).json({ 
      message: 'Error generating PDF', 
      error: error.message 
    });
  }
});

// @route   GET /api/reports/download/efficiency-report
// @desc    Download Efficiency Report as PDF
// @access  Private (HR/Admin)
router.get('/download/efficiency-report', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    // Fetch efficiency report data (reuse logic from efficiency-report endpoint)
    const response = await fetch(`http://localhost:5000/api/reports/efficiency-report`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch efficiency report data');
    }
    
    const data = await response.json();

    // Generate PDF
    const doc = pdfService.generateEfficiencyReport(data);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=efficiency-report-${Date.now()}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating efficiency report PDF:', error);
    res.status(500).json({ 
      message: 'Error generating PDF', 
      error: error.message 
    });
  }
});

// @route   GET /api/reports/download/compliance-report
// @desc    Download Compliance Report as PDF
// @access  Private (HR/Admin)
router.get('/download/compliance-report', verifyToken, isHROrAdmin, async (req, res) => {
  try {
    // Fetch compliance report data (reuse logic from compliance-report endpoint)
    const response = await fetch(`http://localhost:5000/api/reports/compliance-report`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch compliance report data');
    }
    
    const data = await response.json();

    // Generate PDF
    const doc = pdfService.generateComplianceReport(data);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=compliance-report-${Date.now()}.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating compliance report PDF:', error);
    res.status(500).json({ 
      message: 'Error generating PDF', 
      error: error.message 
    });
  }
});

module.exports = router;
