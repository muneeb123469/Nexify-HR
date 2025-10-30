# Quick Start Guide - Task Tracking Feature

## 🚀 Get Started in 3 Steps

### Step 1: Create Sample Tasks (Optional but Recommended)

Open a terminal and run:

```bash
cd server
node utils/createSampleTasks.js
```

**Expected Output:**
```
MongoDB Connected
Found HR user: [HR Username]
Found 3 employees
Cleared existing tasks

✅ Successfully created 5 sample tasks:

1. Complete Q4 Financial Report
   Employee: [Employee Name]
   Status: in_progress
   Priority: high
   Due Date: [Date]

2. Update Marketing Campaign
   Employee: [Employee Name]
   Status: completed
   Priority: medium
   Due Date: [Date]

... (3 more tasks)

✅ Sample tasks created successfully!
```

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### Step 3: Access the Feature

1. Open browser: `http://localhost:3000`
2. Login with HR or Admin credentials
3. Navigate to **"Performance & Task Evaluation"**
4. Click on **"Task Tracking"** tab
5. 🎉 You should see all tasks loaded!

---

## 📋 What You'll See

### Task Statistics Dashboard
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ 📊 Total    │ ✅ Completed│ 🔄 In Prog. │ ⚠️ Overdue  │ ⏳ Pending  │
│     5       │      1      │      2      │      1      │      1      │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### Filter Controls
```
Status: [All Status ▼]  Priority: [All Priorities ▼]  
Employee: [All Employees ▼]  Date Range: [All Time ▼]
```

### Task Cards Grid
```
┌────────────────────────────────────────────────────────────┐
│ Complete Q4 Financial Report              [HIGH] [IN-PROG] │
│ 👤 John Doe                                                │
│ Progress: 60%  Due: Jan 15, 2024                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░                                      │
│ 2 / 3 milestones completed  ●●○                           │
│ ⏱️ 12h / 20h                                               │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Test These Features

### ✅ View Tasks
- [x] See all tasks in grid layout
- [x] View task statistics at the top
- [x] See color-coded status and priority badges

### ✅ Filter Tasks
- [x] Filter by Status (Pending, In Progress, Completed, Overdue)
- [x] Filter by Priority (High, Medium, Low)
- [x] Filter by Employee
- [x] Combine multiple filters

### ✅ Task Details
- [x] Click any task card to open detail modal
- [x] View complete task information
- [x] See milestone progress
- [x] Read comments and updates
- [x] View time tracking

### ✅ Update Status
- [x] Click status buttons in modal
- [x] Watch status update in real-time
- [x] See statistics update automatically

---

## 🔍 Troubleshooting

### Problem: "No tasks found"

**Solution 1:** Create sample tasks
```bash
cd server
node utils/createSampleTasks.js
```

**Solution 2:** Check if you're logged in as HR/Admin
- Only HR and Admin users can view all tasks
- Employee users can only see their own tasks

### Problem: "Error Loading Tasks"

**Check:**
1. Backend server is running on port 5000
2. MongoDB is connected
3. You're logged in with valid credentials
4. Check browser console for error details

**Fix:**
```bash
# Restart backend
cd server
npm start

# Check MongoDB connection in server logs
```

### Problem: "401 Unauthorized"

**Solution:** Your session expired
1. Logout
2. Login again
3. Navigate back to Task Tracking

### Problem: Sample script fails

**Check:**
1. You have at least one HR user
2. You have at least one Employee user
3. MongoDB is running

**Create users if needed:**
```bash
cd server
node utils/createSampleUser.js
```

---

## 📊 Sample Data Overview

The sample script creates 5 tasks:

| Task | Employee | Status | Priority | Category |
|------|----------|--------|----------|----------|
| Q4 Financial Report | Employee 1 | In Progress | High | Reporting |
| Marketing Campaign | Employee 2 | Completed | Medium | Marketing |
| Client Follow-up | Employee 3 | Overdue | High | Sales |
| Security Audit | Employee 1 | Pending | High | Technical |
| Website Redesign | Employee 2 | In Progress | Medium | Design |

---

## 🎨 UI Features

### Color Coding

**Status Colors:**
- 🟢 Completed: Green
- 🔵 In Progress: Blue
- 🟡 Pending: Yellow/Orange
- 🔴 Overdue: Red

**Priority Colors:**
- 🔴 High: Red
- 🟡 Medium: Orange
- 🟢 Low: Green

**Progress Colors:**
- 🟢 80-100%: Green (Excellent)
- 🔵 50-79%: Blue (Good)
- 🟡 25-49%: Orange (Fair)
- 🔴 0-24%: Red (Needs Attention)

---

## 🔐 User Roles

### HR/Admin Users Can:
- ✅ View all tasks
- ✅ Filter by any employee
- ✅ Update task status
- ✅ View all statistics
- ✅ Access task details

### Employee Users Can:
- ✅ View only their own tasks
- ✅ Update their task status
- ✅ View their statistics
- ✅ Add comments (if implemented)

---

## 📱 Responsive Design

The interface works on:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px - 1920px)
- 📱 Tablet (768px - 1366px)
- 📱 Mobile (320px - 768px)

---

## 🎓 Next Steps

### Learn More:
- Read `TASK_TRACKING_IMPLEMENTATION.md` for technical details
- Check `TASK_TRACKING_FLOW.md` for architecture overview
- Review `IMPLEMENTATION_SUMMARY.md` for complete feature list

### Extend the Feature:
- Add task assignment functionality
- Implement real-time updates
- Add export to CSV/PDF
- Create analytics charts
- Add email notifications

---

## 📞 Need Help?

### Check These Files:
1. `IMPLEMENTATION_SUMMARY.md` - Quick overview
2. `TASK_TRACKING_IMPLEMENTATION.md` - Detailed documentation
3. `TASK_TRACKING_FLOW.md` - Architecture diagrams

### Common Issues:
- Backend not running → Start with `npm start` in server folder
- Frontend not running → Start with `npm start` in client folder
- No tasks showing → Run sample data script
- Can't login → Check user credentials
- 401 errors → Login again

---

## ✅ Success Checklist

- [ ] Backend server running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] MongoDB connected
- [ ] Sample tasks created
- [ ] Logged in as HR/Admin
- [ ] Can see Task Tracking tab
- [ ] Tasks are loading
- [ ] Can filter tasks
- [ ] Can open task details
- [ ] Can update task status
- [ ] Statistics are showing correctly

---

**🎉 Congratulations! Your Task Tracking feature is ready to use!**
