# Student Management System

A full-stack web application for managing student records, built with **React, Vite, Node.js, Express, and MongoDB**. It provides a simple interface for creating, viewing, updating, and deleting student information, with server-side validation and database persistence.

## Features

- **Add Students** — Create student records with the required information.
- **View Students** — Display student records in the application.
- **View Student Details** — View individual student information.
- **Edit Student Records** — Update existing student information.
- **Delete Students** — Remove student records.
- **Input Validation** — Validate student data before saving.
- **Duplicate Prevention** — Prevent duplicate student IDs and email addresses where enforced by the backend.
- **MongoDB Integration** — Store student records in a database.
- **REST API** — Handle student-related operations through Express API endpoints.
- **Error Handling** — Handle invalid input, API errors, and database-related errors.
- **Automated Tests** — Run backend tests using Node.js's built-in test runner.
- **Production Build** — Build the frontend using Vite.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- Mongoose
- REST API

### Database
- MongoDB

### Testing and Development
- Node.js built-in test runner
- npm
- Git and GitHub

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
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

*Note: The structure above summarizes the main project directories. Individual files may vary as the project develops.*

## Prerequisites

Install the following before running the application:

- [Node.js](https://nodejs.org/) — preferably an LTS version.
- npm — included with Node.js.
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) — for a local MongoDB database.
- A code editor such as [Visual Studio Code](https://code.visualstudio.com/).

Make sure MongoDB is running before starting the application.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Amal0006/student-management-system.git
```

### 2. Open the project directory

```bash
cd student-management-system
```

### 3. Install dependencies

Run the following command from the project root:

```bash
npm run install:all
```

This installs the backend and frontend dependencies. If the root dependencies have not been installed yet, run:

```bash
npm install
```

### 4. Configure the backend environment

Create a `.env` file inside the `backend` directory by copying `backend/.env.example`.

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Open `backend/.env` and configure the values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/student_management
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

These settings configure the backend port, MongoDB connection, frontend origin, and application environment.

If your MongoDB instance uses a different connection string, update `MONGODB_URI` accordingly.

### 5. Configure the frontend environment

The frontend example file is `frontend/.env.example`.

To create a local environment file in PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Configure `frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Ensure that the API base URL matches the backend address and API prefix used by the application.

## Running the Application

From the project root, run:

```bash
npm run dev
```

This starts the frontend and backend development servers using the root development script.

Open the application in your browser:

- **Frontend:** http://localhost:5173/
- **Backend:** http://localhost:5000/

The backend URL is the server address; individual API endpoints are available under the API prefix configured by the application.

Keep the terminal running while using the application.

## Testing

Run the backend automated tests from the project root:

```bash
npm test
```

The test script delegates to the backend test command.

## Production Build

Build the frontend for production by running:

```bash
npm run build
```

Vite generates the production build in the frontend's `dist` directory.

## Troubleshooting

### MongoDB connection error

- Ensure MongoDB is installed and running.
- Verify the `MONGODB_URI` value in `backend/.env`.
- Check that the database host and port are correct.

### Frontend cannot connect to the backend

- Confirm that both development servers are running.
- Verify `VITE_API_BASE_URL` in `frontend/.env`.
- Check that the frontend API URL matches the backend API prefix.
- Review the backend terminal for errors.

### Port already in use

Another application may already be using port `5000` or `5173`. Stop the conflicting process or configure an available port, making sure the frontend API URL matches the backend configuration.

### Dependencies or scripts fail

Run the commands from the project root and confirm that Node.js and npm are installed:

```bash
node --version
npm --version
```

If installation fails, review the terminal error before removing or reinstalling dependencies.

## Security Notes

- Do not commit `.env` files or database credentials to GitHub.
- Keep `.env.example` files limited to placeholder or local development values.
- Validate incoming data on the backend.
- Use appropriate access controls before deploying the application for real users.
- Configure production database credentials and environment variables securely.

## Project Status

The project includes student record CRUD operations, backend validation, MongoDB integration, backend tests, and a frontend production build.

Before deployment, verify the latest code, environment configuration, test results, and production database settings.

## Future Improvements

Potential enhancements include:

- Authentication and role-based access control.
- Search, filtering, and pagination.
- Student profile images and document uploads.
- Dashboard statistics and reports.
- Responsive UI improvements.
- Cloud deployment and production monitoring.

## Author

**Amal S**

GitHub: [Amal0006](https://github.com/Amal0006)

Portfolio: [amal0006.github.io](https://amal0006.github.io)

## License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under an open-source license.
