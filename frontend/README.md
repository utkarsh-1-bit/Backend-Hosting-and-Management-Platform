# HosteX Frontend Console

A clean, responsive management console for HosteX — a distributed backend hosting and container workload management platform.

## Features

- **Authentication & User Management**: Register and sign in with credential verification against the Spring Boot backend (`/api/users/login`, `/api/users/register`).
- **Application Lifecycle**: Create, start, stop, restart, and delete hosted applications (`/api/applications`).
- **Live Service URL Resolution**: Automatically links to running Docker container host ports dynamically allocated by the backend runtime.
- **Environment Variable Configuration**: Key-value store management for runtime container injection (`/api/applications/{id}/env`).
- **Workload Scheduler Simulation**: Interactive visualization of CPU scheduling algorithms (First-Come First-Served, Shortest Job First, Priority Scheduling) matching the backend scheduling strategies.
- **System Diagnostics**: Real-time ping and health check monitoring connectivity to the Spring Boot REST API (`http://localhost:8080`).
- **Resilient Offline Fallback**: Graceful local preview mode if the backend or database is temporarily offline during evaluation.

## Technology Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Telemetry Charts**: Recharts
- **Styling**: Modern Vanilla CSS design system with dark theme tokens

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
By default, the Vite development server proxies all `/api` requests to `http://localhost:8080`.
To specify an alternate backend endpoint, create a `.env` file:
```env
VITE_API_URL=http://localhost:8080
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

## Backend API Integration Contract

| Feature | Method | Endpoint | Description |
|---|---|---|---|
| Auth: Register | `POST` | `/api/users/register` | Registers user `{ name, email, password }` |
| Auth: Login | `POST` | `/api/users/login` | Authenticates `{ email, password }` |
| Apps: List User Apps | `GET` | `/api/applications/user/{userId}` | Returns list of user's applications |
| Apps: Details & Live URL | `GET` | `/api/applications/{id}` | Returns application status and live URL |
| Apps: Create | `POST` | `/api/applications` | Creates new application and queues deploy job |
| Apps: Update | `PUT` | `/api/applications/{id}` | Updates application build/start commands |
| Apps: Delete | `DELETE` | `/api/applications/{id}` | Cascades deletion of containers, env, and jobs |
| Apps: Start | `POST` | `/api/applications/{id}/start` | Starts container instance |
| Apps: Stop | `POST` | `/api/applications/{id}/stop` | Stops container instance |
| Apps: Restart | `POST` | `/api/applications/{id}/restart` | Restarts container instance |
| Env: List | `GET` | `/api/applications/{id}/env` | Fetches environment variables |
| Env: Create | `POST` | `/api/applications/{id}/env` | Creates variable `{ variableKey, variableValue }` |
| Env: Update | `PUT` | `/api/applications/{id}/env/{key}` | Updates variable value by key |
| Env: Delete | `DELETE` | `/api/applications/{id}/env/{key}` | Removes variable by key |
