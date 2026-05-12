# Nexify-HR

Nexify-HR is a MERN-style HR and job portal for applicant registration, login, job browsing, job applications, resume upload, HR job management, and basic admin approval workflows.

## Tech Stack

- Frontend: React 18, Create React App, React Router, Axios, Styled Components, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose, Multer
- Resume parser: Python, PyMuPDF, python-docx, pdfminer.six, pdf2image, pytesseract

## Folder Structure

```text
client/    React frontend
server/    Express API, MongoDB models, upload middleware, resume parser
```

## Local Setup

Requirements:
- Node.js and npm
- MongoDB running locally or a MongoDB connection string
- Python 3 with pip for resume parsing

## Backend Setup

```bash
cd server
npm install
copy .env.example .env
npm run seed
npm start
```

Backend runs at `http://localhost:5000` and API routes are mounted under `/api`.

## Frontend Setup

```bash
cd client
npm install
copy .env.example .env
npm start
```

Frontend runs at `http://localhost:3000`.

## Environment Variables

Backend:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`
- `CV_PARSE_TIMEOUT_MS`
- `PYTHON_BIN`

Frontend:
- `REACT_APP_API_URL`

## Resume Parser Setup

```bash
cd server
python -m pip install --upgrade pip
python -m pip install -r services/requirements.txt
python -c "import fitz, docx, pdfminer.high_level, pdf2image, pytesseract; print('parser deps ok')"
```

## Demo Workflow

1. Start MongoDB.
2. Seed demo data with `cd server && npm run seed`.
3. Start backend with `npm start`.
4. Start frontend with `cd client && npm start`.
5. Login as the applicant demo user.
6. Browse jobs, open a job, submit an application with a resume, then view applications.

## Demo Credentials

- Applicant: `applicant.demo@nexify.local` / `Demo@12345`
- HR: `hr.demo@nexify.local` / `Demo@12345`

## Known Limitations

- Demo passwords are stored in plain text by the current development auth model.
- Some dashboards contain placeholder/mock sections.
- Uploaded resumes are stored on local disk under `server/uploads`.
- Resume parsing depends on local Python packages being installed.
