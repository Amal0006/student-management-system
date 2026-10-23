# Student Management System

A full-stack web application for managing student records. The application supports creating, viewing, updating, and deleting student information, with validation and MongoDB persistence.

## Features

- Add new student records
- View the list of students
- View individual student details
- Edit existing student information
- Delete student records with confirmation
- Validate required fields and email addresses
- Prevent duplicate student IDs and email addresses
- Store student records in MongoDB
- Provide frontend and backend error handling

## Technology Stack

**Frontend**
- React
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- Mongoose

**Database**
- MongoDB

## Project Structure

```text
student-management-system/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── test/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Community Server, running locally, or an accessible MongoDB instance
- A code editor such as Visual Studio Code

## Installation

Clone or extract the project, then open a terminal in the project root.

Install the project dependencies:

```bash
npm run install:all
```

Create the backend environment file by copying `backend/.env.example` to `backend/.env`.

If the frontend requires environment variables, copy `frontend/.env.example` to `frontend/.env` as well.

Configure the MongoDB connection string in `backend/.env`. For a local MongoDB instance, the configuration can look like this:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/student_management
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Use the variable names expected by your provided `.env.example` files.

## Run the Application

From the project root, run:

```bash
npm run dev
```

The frontend is available at:

http://localhost:5173/

The backend API runs at:

http://localhost:5000/

Keep the terminal running while using the application.

## Validation and Data Persistence

The application validates student information and rejects invalid or incomplete submissions. Student IDs and email addresses must be unique. Student records are stored in MongoDB and remain available after refreshing the browser, provided the database is running and the records have been saved successfully.

## Testing

Run the backend automated tests:

```bash
npm test
```

Build the frontend for production:

```bash
npm run build
```

The backend test suite checks input validation, email normalization, missing required fields, and related validation scenarios.

## Troubleshooting

**MongoDB connection error**
- Ensure MongoDB is installed and running.
- Check `MONGODB_URI` in `backend/.env`.

**Frontend cannot reach the backend**
- Confirm the backend is running on port 5000.
- Check the API URL and `CLIENT_ORIGIN` configuration.

**Port already in use**
- Stop the other process using the port or configure a different port consistently.

**Dependencies missing**
- Run `npm run install:all` from the project root.

## Security and Submission

- Do not commit `.env` files containing private credentials.
- Keep `.env.example` files with placeholder configuration values.
- Do not include `node_modules` in the submission package.

## Project Status

The project has been manually tested for CRUD operations, validation, and MongoDB persistence. The backend automated tests and frontend production build have also passed in the development environment.
