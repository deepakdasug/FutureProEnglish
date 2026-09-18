# Future Pro English

Future Pro English is a responsive English-language learning website with course information, student enrollment, login, contact, and management workflows. It includes a lightweight Node.js server that serves the frontend and provides the JSON API used by the forms and dashboards.

## Features

- Responsive homepage with animated activity cards orbiting the `Enroll Now` action.
- About, contact, enrollment, login, and management pages.
- Enrollment form with country and state selection data.
- Student enrollment API with generated student IDs and submission timestamps.
- Student and management authentication by email or phone.
- Management dashboard data endpoints and management-person creation.
- JSON-backed local persistence for development.
- Keyboard-friendly navigation and responsive mobile navigation.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js built-in `http` and `fs/promises` modules
- JSON file storage for local development

## Requirements

- Node.js 18 or newer

No npm packages are required.

## Run Locally

From the project directory, start the server:

```powershell
node server.js
```

Then open:

```text
http://localhost:8000
```

The server also exposes the local network preview address printed in the terminal when it starts.

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/students` | Return public student records without passwords. |
| `GET` | `/api/management-data` | Return public student and management records. |
| `POST` | `/api/enrollments` | Save a new student enrollment. |
| `POST` | `/api/authenticate` | Authenticate a student or management account. |
| `POST` | `/api/management-persons` | Create a management account. |

## Project Structure

```text
.
├── assets/                 # Images and branding assets
├── css/                    # Shared and form-specific styles
├── data/                   # Local development data store
├── js/                     # Frontend behavior and JSON data
├── about.html              # About page
├── api/                    # Vercel serverless API functions
├── contact.html            # Contact page
├── enroll.html             # Enrollment workflow
├── index.html              # Homepage
├── login.html              # Login workflow
├── management.html         # Management dashboard
└── server.js               # Static server and API routes
```

## Data and Security

The current JSON data file is intended only for local development. Do not commit real passwords, personal information, or production records. Before publishing this project, replace the local records with anonymized sample data and use a proper authentication and database solution for production.

The server removes passwords from API responses, but passwords are still stored in the local JSON file for the demo authentication flow. This is not suitable for production use.

## Deployment Notes

This project can run on any host that supports Node.js. For production deployment, add environment-based configuration, HTTPS, input validation, rate limiting, secure password hashing, a database, and a production process manager.

The demo includes a Vercel-compatible `api/authenticate.js` serverless function. It supports student and management login by email or phone without requiring `server.js`, so the login flow can run after deploying this repository directly to Vercel. The demo still reads credentials from `data/records.json`; enrollment writes and other mutating API routes require a persistent database for Vercel deployment.

## License

No license has been selected for this project yet.