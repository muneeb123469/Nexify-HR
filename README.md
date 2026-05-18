# Nexify HR

Nexify HR is a full-stack MERN HR management and recruitment portal with role-based dashboards for Applicants, HR, Employees, and Admin users.

The system supports job posting, applicant tracking, interview scheduling, offer letters, employee management, attendance tracking, leave requests, payroll support, wellness management, remote work tracking, and admin-controlled office location settings.

## Screenshots

### Login Page

![Login Page](docs/screenshots/01-login-page.png)

### HR Dashboard

![HR Dashboard](docs/screenshots/02-hr-dashboard.png)

### Candidate Profile

![Candidate Profile](docs/screenshots/03-candidate-profile.png)

### Employee Attendance

![Employee Attendance](docs/screenshots/04-employee-attendance.png)

### Admin Dashboard

![Admin Dashboard](docs/screenshots/05-admin-dashboard.png)

### Admin Location Settings

![Admin Location Settings](docs/screenshots/06-admin-location-settings.png)

## User Roles

### Applicant

- Register with email verification
- Browse job postings
- Apply for jobs with resume upload
- Track application status
- Receive interview and offer emails

### HR

- Create and manage job postings
- Review candidate applications
- Shortlist candidates
- Schedule interviews
- Send offer letters
- Manage employees
- Review attendance and leave requests
- Manage payroll, payslips, tasks, wellness, and work-hour tracking

### Employee

- View employee dashboard
- Check in and check out using browser geolocation
- Submit leave requests
- Manage personal information
- Track assigned tasks
- Use wellness and remote work features

### Admin

- Access protected admin dashboard
- Manage HR/admin settings
- Configure approved office locations
- Set office attendance radius for geolocation-based attendance

## Professional Role Flow

For security reasons, users do not select their own role during registration.

Public registration creates an Applicant account by default. HR/Admin users manage role transitions after recruitment, approval, or onboarding.

Typical workflow:

```text
Applicant registers
Applicant applies for a job
HR reviews the application
HR shortlists the candidate
HR schedules an interview
HR sends an offer letter
Candidate is onboarded as an employee
Employee logs in and is redirected to Employee Dashboard
```

## Tech Stack

### Frontend

- React.js
- React Router
- Axios
- Styled Components
- React Icons

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer
- Multer
- Python-based resume parsing support

## Environment Variables

Create a `.env` file inside the `server` folder.

Example:

```env
MONGODB_URI=mongodb://localhost:27017/job-portal
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM_ADDRESS=your_email@gmail.com
EMAIL_FROM_NAME=Nexify HR
PYTHON_BIN=python
CV_PARSE_TIMEOUT_MS=15000
```

Do not commit real `.env` secrets to GitHub.

## Installation

### Backend

```bash
cd server
npm install
npm start
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## Build

```bash
cd client
npm run build
```

## Notes

- Use Chrome for geolocation-based attendance testing.
- Attendance requires approved office locations and radius setup from Admin Location Settings.
- Gmail email sending requires a Gmail App Password, not a normal Gmail password.
- Resume parsing depends on local Python parser dependencies.

## My Contribution

This project was completed as a Final Year Project. My major work included:

- Stabilizing and testing the full MERN project
- Connecting and testing HR, Applicant, Employee, and Admin dashboard flows
- Configuring secure role-based routing
- Adding protected admin role support
- Fixing admin logout behavior
- Moving email sender configuration to environment variables
- Connecting parsed resume data with job applications
- Improving candidate profile behavior
- Fixing attendance geolocation check-in/check-out flow
- Testing recruitment, interview scheduling, offer letter, leave, attendance, admin location, and employee workflows
- Preparing the project for GitHub portfolio presentation

## Status

This project is functional for local demo, academic evaluation, and portfolio presentation. Some analytics/dashboard sections may contain demo/static data and can be improved further for production use.

## License

This project is for academic and portfolio purposes.