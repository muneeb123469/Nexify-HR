# Task Tracking Data Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                  (Performance & Task Evaluation)                │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TaskTracking Component                     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Stats      │  │   Filters    │  │  Task Grid   │        │
│  │   Overview   │  │   Controls   │  │   Display    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Task Detail Modal                           │ │
│  │  - Full task information                                 │ │
│  │  - Milestones progress                                   │ │
│  │  - Comments & updates                                    │ │
│  │  - Status update buttons                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│                      (axios with JWT)                           │
│                                                                 │
│  GET  /api/tasks/all                                           │
│  GET  /api/tasks/employees/list                                │
│  PUT  /api/tasks/:taskId/status                                │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                             │
│                    (Express.js + Node.js)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Authentication Middleware                   │ │
│  │  - Verify JWT token                                      │ │
│  │  - Check user role (HR/Admin)                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                  Task Routes                             │ │
│  │  - GET /all - Fetch all tasks with filters              │ │
│  │  - GET /employees/list - Get employee list              │ │
│  │  - PUT /:taskId/status - Update task status             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   Task Model                             │ │
│  │  - Schema validation                                     │ │
│  │  - Business logic methods                                │ │
│  │  - Status calculations                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
│                      (MongoDB)                                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │    Tasks     │  │    Users     │  │  Comments    │        │
│  │  Collection  │  │  Collection  │  │  (embedded)  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### 1. Initial Load
```
User Opens Task Tracking
         │
         ▼
Component Mounts
         │
         ▼
useEffect Hook Triggers
         │
         ▼
fetchTasksAndEmployees()
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
  GET /api/tasks/all    GET /api/tasks/employees/list
         │                         │
         ▼                         ▼
  Backend validates JWT   Backend validates JWT
         │                         │
         ▼                         ▼
  Check HR/Admin role     Check HR/Admin role
         │                         │
         ▼                         ▼
  Query MongoDB           Query MongoDB
         │                         │
         ▼                         ▼
  Return tasks array      Return employees array
         │                         │
         └─────────────────────────┘
                   │
                   ▼
         Transform data format
                   │
                   ▼
         Update component state
                   │
                   ▼
         Render tasks in UI
```

### 2. Filter Tasks
```
User Changes Filter
         │
         ▼
handleFilterChange()
         │
         ▼
Update filters state
         │
         ▼
useEffect Hook Triggers
         │
         ▼
Filter tasks locally
         │
         ▼
Update filteredTasks state
         │
         ▼
Re-render task grid
```

### 3. Update Task Status
```
User Clicks Status Button
         │
         ▼
updateTaskStatus(taskId, newStatus)
         │
         ▼
Convert status format
(in-progress → in_progress)
         │
         ▼
PUT /api/tasks/:taskId/status
         │
         ▼
Backend validates JWT
         │
         ▼
Check permissions
         │
         ▼
Update task in MongoDB
         │
         ▼
Return updated task
         │
         ▼
Update local state
         │
         ▼
Re-render UI with new status
```

## Component State Management

```javascript
TaskTracking Component State:
├── tasks: Task[]              // All tasks from backend
├── filteredTasks: Task[]      // Filtered subset of tasks
├── filters: FilterState       // Current filter selections
├── selectedTask: Task | null  // Task shown in modal
├── showTaskModal: boolean     // Modal visibility
├── employees: Employee[]      // Employee list for filters
├── loading: boolean           // Loading state
└── error: string | null       // Error message
```

## Data Transformation

### Backend → Frontend
```javascript
Backend Task:
{
  _id: "507f1f77bcf86cd799439011",
  status: "in_progress",
  employeeId: { _id: "...", name: "..." },
  milestones: [{ _id: "...", ... }],
  comments: [{ _id: "...", message: "...", timestamp: "..." }]
}

↓ Transform ↓

Frontend Task:
{
  id: "507f1f77bcf86cd799439011",
  status: "in-progress",
  employee: { id: "...", name: "..." },
  milestones: [{ id: "...", ... }],
  comments: [{ id: "...", text: "...", date: "..." }]
}
```

### Frontend → Backend
```javascript
Frontend Status: "in-progress"
         ↓
Backend Status: "in_progress"
```

## Security Flow

```
Request
   │
   ▼
Extract JWT from Authorization header
   │
   ▼
Verify token signature
   │
   ├─── Invalid ──→ 401 Unauthorized
   │
   ▼
Check token expiration
   │
   ├─── Expired ──→ 401 Token Expired
   │
   ▼
Extract user info from token
   │
   ▼
Check user role
   │
   ├─── Not HR/Admin ──→ 403 Forbidden
   │
   ▼
Process request
   │
   ▼
Return response
```

## Error Handling Flow

```
API Call
   │
   ├─── Success ──→ Update state ──→ Render UI
   │
   ├─── Network Error ──→ Set error state ──→ Show error UI
   │
   ├─── 401 Unauthorized ──→ Clear auth ──→ Redirect to login
   │
   ├─── 403 Forbidden ──→ Show access denied
   │
   └─── 500 Server Error ──→ Show error message ──→ Offer retry
```

## Performance Optimizations

1. **Single API Call**: Fetch all tasks once, filter locally
2. **Memoization**: Filter logic runs only when filters or tasks change
3. **Lazy Loading**: Modal content loaded only when opened
4. **Efficient Updates**: Only update affected tasks on status change
5. **Indexed Queries**: MongoDB indexes on employeeId, status, dueDate

## Future Enhancements

```
Current Flow:
User → Frontend → Backend → Database

Potential Real-time Flow:
User → Frontend ←→ WebSocket ←→ Backend ←→ Database
                      ↓
              Broadcast to all connected clients
```
