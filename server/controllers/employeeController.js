const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');

// Get employee performance data for HR dashboard
const getEmployeePerformanceData = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Get employee data
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get task statistics
    const taskStats = await getEmployeeTaskStats(employeeId);
    
    // Get attendance statistics
    const attendanceStats = await getEmployeeAttendanceStats(employeeId);
    
    // Calculate derived fields
    const performanceData = {
      // Basic Info
      employeeId: employee.employeeId,
      name: employee.username,
      email: employee.email,
      department: employee.department,
      jobTitle: employee.jobTitle,
      
      // Calculated Fields
      yearsInCompany: employee.getYearsInCompany(),
      yearsInRole: employee.getYearsInRole(),
      workLocation: employee.workMode || 'Office',
      salaryBand: employee.getSalaryBand(),
      
      // Task Data
      tasksAssigned: taskStats.totalAssigned,
      tasksCompleted: taskStats.totalCompleted,
      
      // Additional HR Model Fields
      attendanceRate: employee.attendanceRate || attendanceStats.attendanceRate,
      onTimeRate: employee.onTimeRate || attendanceStats.onTimeRate,
      avgLateMinutes: employee.avgLateMinutes || 0,
      avgWorkHours: employee.avgWorkHours || 8,
      monthlyHoursWorked: employee.monthlyHoursWorked || attendanceStats.monthlyHours,
      taskQualityScore: employee.taskQualityScore || 0,
      peerReviewScore: employee.peerReviewScore || 0,
      managerRating: employee.managerRating || 0,
      trainingHoursCompleted: employee.trainingHoursCompleted || 0,
      promotionsLast3Years: employee.promotionsLast3Years || 0,
      disciplinaryActions: employee.disciplinaryActions || 0,
      
      // Additional Stats
      taskCompletionRate: taskStats.completionRate,
      currentStatus: employee.status,
      lastUpdated: employee.updatedAt
    };

    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching employee performance data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all employees with performance data
const getAllEmployeesPerformanceData = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee', status: 'Active' });
    
    const performanceDataPromises = employees.map(async (employee) => {
      const taskStats = await getEmployeeTaskStats(employee._id);
      const attendanceStats = await getEmployeeAttendanceStats(employee._id);
      
      return {
        employeeId: employee.employeeId,
        name: employee.username,
        email: employee.email,
        department: employee.department,
        jobTitle: employee.jobTitle,
        yearsInCompany: employee.getYearsInCompany(),
        yearsInRole: employee.getYearsInRole(),
        workLocation: employee.workMode || 'Office',
        salaryBand: employee.getSalaryBand(),
        tasksAssigned: taskStats.totalAssigned,
        tasksCompleted: taskStats.totalCompleted,
        taskCompletionRate: taskStats.completionRate,
        attendanceRate: employee.attendanceRate || attendanceStats.attendanceRate,
        onTimeRate: employee.onTimeRate || attendanceStats.onTimeRate,
        monthlyHoursWorked: employee.monthlyHoursWorked || attendanceStats.monthlyHours,
        currentStatus: employee.status
      };
    });
    
    const performanceData = await Promise.all(performanceDataPromises);
    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching all employees performance data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update employee work mode
const updateEmployeeWorkMode = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { workMode } = req.body;
    
    if (!['Online', 'Hybrid', 'Office'].includes(workMode)) {
      return res.status(400).json({ message: 'Invalid work mode. Must be Online, Hybrid, or Office' });
    }
    
    const employee = await User.findByIdAndUpdate(
      employeeId,
      { workMode },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Work mode updated successfully', workMode: employee.workMode });
  } catch (error) {
    console.error('Error updating work mode:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update employee performance metrics
const updateEmployeePerformanceMetrics = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;
    
    // Validate numeric fields
    const numericFields = [
      'attendanceRate', 'onTimeRate', 'avgLateMinutes', 'avgWorkHours',
      'monthlyHoursWorked', 'taskQualityScore', 'peerReviewScore',
      'managerRating', 'trainingHoursCompleted', 'promotionsLast3Years',
      'disciplinaryActions'
    ];
    
    const validUpdates = {};
    for (const field of numericFields) {
      if (updates[field] !== undefined) {
        const value = parseFloat(updates[field]);
        if (!isNaN(value)) {
          validUpdates[field] = value;
        }
      }
    }
    
    const employee = await User.findByIdAndUpdate(
      employeeId,
      validUpdates,
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Performance metrics updated successfully', employee });
  } catch (error) {
    console.error('Error updating performance metrics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to get employee task statistics
async function getEmployeeTaskStats(employeeId) {
  try {
    const tasks = await Task.find({ employeeId, isActive: true });
    const totalAssigned = tasks.length;
    const totalCompleted = tasks.filter(task => task.status === 'completed').length;
    const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
    
    return {
      totalAssigned,
      totalCompleted,
      completionRate,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      overdue: tasks.filter(task => task.status === 'overdue').length
    };
  } catch (error) {
    console.error('Error getting task stats:', error);
    return { totalAssigned: 0, totalCompleted: 0, completionRate: 0 };
  }
}

// Helper function to get employee attendance statistics
async function getEmployeeAttendanceStats(employeeId) {
  try {
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Get attendance records for current month
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: currentMonth }
    });
    
    if (attendanceRecords.length === 0) {
      return {
        attendanceRate: 0,
        onTimeRate: 0,
        monthlyHours: 0,
        avgLateMinutes: 0
      };
    }
    
    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => 
      record.status === 'completed' || record.status === 'checked-out'
    ).length;
    
    const totalMinutes = attendanceRecords.reduce((sum, record) => 
      sum + (record.totalWorkingMinutes || 0), 0
    );
    
    const monthlyHours = Math.round(totalMinutes / 60);
    const attendanceRate = totalDays > 0 ? presentDays / totalDays : 0;
    
    // For now, set onTimeRate to a default value - this would need more detailed tracking
    const onTimeRate = 0.85; // Default 85% on-time rate
    
    return {
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      onTimeRate,
      monthlyHours,
      avgLateMinutes: 0 // Would need more detailed time tracking
    };
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    return {
      attendanceRate: 0,
      onTimeRate: 0,
      monthlyHours: 0,
      avgLateMinutes: 0
    };
  }
}

module.exports = {
  getEmployeePerformanceData,
  getAllEmployeesPerformanceData,
  updateEmployeeWorkMode,
  updateEmployeePerformanceMetrics
};