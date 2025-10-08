# Design Document

## Overview

This design implements the missing backend functionality for the leave management system. The frontend form already exists and captures leave request data, but currently only logs to console. We need to create a complete backend solution including database model, API endpoints, and frontend integration.

## Architecture

The solution follows the existing application architecture pattern:
- **Model Layer**: MongoDB schema using Mongoose (similar to existing User, Attendance models)
- **Route Layer**: Express.js API endpoints (following existing route patterns)
- **Controller Layer**: Business logic for leave request processing
- **Frontend Integration**: Update existing LeaveRequest component to call API

## Components and Interfaces

### 1. Leave Application Model (`server/models/LeaveApplication.js`)

```javascript
{
  employeeId: ObjectId (ref: 'User'),
  employeeName: String,
  employeeEmail: String,
  department: String,
  leaveType: String (enum),
  startDate: Date,
  endDate: Date,
  reason: String,
  status: String (enum: 'pending', 'approved', 'rejected'),
  attachments: String (file path),
  appliedDate: Date,
  reviewedBy: ObjectId (ref: 'User'),
  reviewedDate: Date,
  reviewComments: String,
  timestamps: true
}
```

### 2. API Endpoints (`server/Routes/leaveRoutes.js`)

- `POST /api/leave/apply` - Submit new leave request
- `GET /api/leave/employee/:employeeId` - Get employee's leave requests
- `GET /api/leave/all` - Get all leave requests (HR access)
- `PUT /api/leave/:id/status` - Update leave request status (HR access)

### 3. Controller Functions (`server/controllers/leaveController.js`)

- `applyLeave()` - Handle leave application submission
- `getEmployeeLeaves()` - Retrieve employee's leave history
- `getAllLeaves()` - Retrieve all leave requests for HR
- `updateLeaveStatus()` - Approve/reject leave requests

### 4. Frontend Integration

Update `client/src/components/leave/LeaveRequest.js`:
- Replace console.log with API call to `/api/leave/apply`
- Add loading states and success/error handling
- Include user authentication token in requests
- Display confirmation messages

## Data Models

### Leave Application Schema

```javascript
const leaveApplicationSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeEmail: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['casual', 'sick', 'annual', 'maternity', 'paternity'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  attachments: {
    type: String, // File path for uploaded documents
    default: null
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedDate: {
    type: Date,
    default: null
  },
  reviewComments: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});
```

## Error Handling

### Validation Errors
- Required field validation (leave type, dates, reason)
- Date validation (end date after start date)
- Employee existence validation
- File upload validation (if attachments provided)

### Business Logic Errors
- Overlapping leave requests
- Invalid date ranges
- Unauthorized access attempts

### Response Format
```javascript
// Success Response
{
  success: true,
  message: "Leave request submitted successfully",
  data: { leaveApplication }
}

// Error Response
{
  success: false,
  message: "Error message",
  errors: ["Specific error details"]
}
```

## Testing Strategy

### Unit Tests
- Model validation tests
- Controller function tests
- Date validation logic tests

### Integration Tests
- API endpoint tests
- Database interaction tests
- Authentication middleware tests

### Frontend Tests
- Form submission tests
- Error handling tests
- Success message display tests

## Implementation Notes

1. **Authentication**: Use existing JWT authentication middleware
2. **File Uploads**: Utilize existing multer configuration for attachments
3. **Database Indexing**: Add indexes on employeeId and status for efficient queries
4. **Validation**: Follow existing validation patterns from other models
5. **Error Messages**: Use consistent error response format across the application