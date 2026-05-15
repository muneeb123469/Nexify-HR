# Nexify-HR Testing Guide

This document records the manual testing completed for Nexify-HR.

## Test Environment

| Item          | Value                     |
| ------------- | ------------------------- |
| Frontend      | React / Create React App  |
| Backend       | Node.js / Express         |
| Database      | MongoDB                   |
| Backend URL   | http://localhost:5000     |
| Frontend URL  | http://localhost:3000     |
| Branch tested | main                      |
| Seed command  | cd server && npm run seed |

## Demo Accounts

All demo accounts use this password:

Demo@12345

| Role      | Email                       | Expected Dashboard   |
| --------- | --------------------------- | -------------------- |
| Applicant | applicant.demo@nexify.local | /applicant-dashboard |
| HR        | hr.demo@nexify.local        | /hr/dashboard        |
| Employee  | employee.demo@nexify.local  | /employee-dashboard  |
| Admin     | admin.demo@nexify.local     | /admin-dashboard     |

## Pre-Test Commands

Run the seed script before manual testing:

cd server  
npm run seed

Start the backend:

cd server  
npm start

Start the frontend in a second terminal:

cd client  
npm start

Optional production build check:

cd client  
npm run build

## Manual Role Flow Test Matrix

| Test Case                                 | Applicant | HR   | Employee | Admin | Result                                           |
| ----------------------------------------- | --------- | ---- | -------- | ----- | ------------------------------------------------ |
| Login with seeded demo account            | Pass      | Pass | Pass     | Pass  | All roles logged in successfully                 |
| Correct dashboard redirect                | Pass      | Pass | Pass     | Pass  | Each role reached its own dashboard              |
| Dashboard page renders                    | Pass      | Pass | Pass     | Pass  | No blank dashboard pages                         |
| Logout works                              | Pass      | Pass | Pass     | Pass  | All roles returned to /login                     |
| Browser Back after logout blocked         | Pass      | Pass | Pass     | Pass  | Protected routes redirected to /login            |
| Wrong role blocked from another dashboard | Pass      | Pass | Pass     | Pass  | Wrong-role users redirect to their own dashboard |

## Applicant Flow Checklist

| Step                      | Expected Result                   | Status |
| ------------------------- | --------------------------------- | ------ |
| Login as Applicant        | Redirects to /applicant-dashboard | Pass   |
| Open Browse Jobs          | Job list renders                  | Pass   |
| Open Job Details          | Job details page renders          | Pass   |
| Click Apply Now           | Application form opens            | Pass   |
| Upload resume             | Resume file is accepted           | Pass   |
| Submit application        | Application is saved              | Pass   |
| Resume parser runs        | Parse success is shown            | Pass   |
| Open Applications         | Applications list renders         | Pass   |
| Logout                    | Redirects to /login               | Pass   |
| Browser Back after logout | Dashboard remains blocked         | Pass   |

## HR Flow Checklist

| Step                      | Expected Result                       | Status |
| ------------------------- | ------------------------------------- | ------ |
| Login as HR               | Redirects to /hr/dashboard            | Pass   |
| Full HR dashboard renders | Sidebar and dashboard overview appear | Pass   |
| Open Job Postings         | Job postings page renders             | Pass   |
| Logout                    | Redirects to /login                   | Pass   |
| Browser Back after logout | Dashboard remains blocked             | Pass   |

## Employee Flow Checklist

| Step                       | Expected Result                      | Status |
| -------------------------- | ------------------------------------ | ------ |
| Login as Employee          | Redirects to /employee-dashboard     | Pass   |
| Employee dashboard renders | Sidebar and dashboard content appear | Pass   |
| Logout                     | Redirects to /login                  | Pass   |
| Browser Back after logout  | Dashboard remains blocked            | Pass   |

## Admin Flow Checklist

| Step                      | Expected Result                 | Status |
| ------------------------- | ------------------------------- | ------ |
| Login as Admin            | Redirects to /admin-dashboard   | Pass   |
| Admin dashboard renders   | Admin dashboard content appears | Pass   |
| Logout                    | Redirects to /login             | Pass   |
| Browser Back after logout | Dashboard remains blocked       | Pass   |

## Security Verification

| Check                          | Expected Result                                         | Status |
| ------------------------------ | ------------------------------------------------------- | ------ |
| Demo passwords are hashed      | Database stores bcrypt hashes, not plain text           | Pass   |
| Login uses password comparison | Backend uses bcrypt comparison                          | Pass   |
| User JSON excludes password    | API does not return password field                      | Pass   |
| Protected routes require login | Unauthenticated dashboard access redirects to /login    | Pass   |
| Role guards are enforced       | Wrong-role access redirects to the user's own dashboard | Pass   |

## Build Verification

Latest verified command:

cd client  
npm run build

Result:

Compiled with warnings.  
The build folder is ready to be deployed.

Current warnings are mostly existing ESLint warnings such as unused variables/imports and accessibility warnings. They do not block the build, but they should be cleaned up in a later polish phase.

## Known Items for Later Phases

| Item                          | Priority | Notes                                                       |
| ----------------------------- | -------- | ----------------------------------------------------------- |
| Fix inactive or dead buttons  | High     | Buttons should either navigate, open details, or be removed |
| Add screenshots to README     | High     | Include role dashboards and resume parser success           |
| Rewrite README professionally | High     | Make it recruiter-friendly                                  |
| Reduce ESLint warnings        | Medium   | Focus on dashboard files first                              |
| Add automated tests           | Medium   | Add backend auth tests and frontend smoke tests             |
| Add deployment or demo video  | Optional | Useful for recruiters                                       |
