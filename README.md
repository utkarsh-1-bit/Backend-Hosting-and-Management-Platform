Backend Hosting and Management Platform

A centralized platform for deploying, hosting, and managing multiple backend applications through a unified dashboard. The system integrates a React frontend, Spring Boot backend, MySQL database, workload scheduling algorithms, and Docker-based runtime management to simplify application deployment and monitoring.

🚀 Overview

The Backend Hosting and Management Platform aims to simplify backend application management by providing a single interface to create, configure, deploy, start, stop, restart, and monitor applications.

Instead of managing backend services manually through terminal commands, developers can use the platform dashboard to manage application lifecycles, configure environment variables, inspect logs, monitor resource usage, and schedule workloads.

The project combines concepts from Operating Systems, DBMS, Computer Networks, and Backend Development to demonstrate how a simplified hosting and management service can be designed.

✨ Key Features

* Application Management: Register applications and manage their lifecycle from a centralized dashboard.
* Automated Deployment: Integrate Git repositories and configure application build and startup commands.
* Runtime Management: Build, run, stop, and restart application containers using Docker.
* Workload Scheduling: Implement FCFS, SJF, SRTF, Round Robin, and Priority scheduling algorithms.
* Resource Monitoring: Monitor CPU usage, memory consumption, application status, and runtime information.
* Logs and Metrics: Access application logs and monitor execution details.
* Environment Variables: Configure application-specific settings without hardcoding configuration values.
* Authentication: Provide user registration, login, and application ownership management.
* Persistent Storage: Store user accounts, application metadata, workload jobs, container information, and environment variables in MySQL.
* REST API: Connect the frontend and backend through HTTP-based REST endpoints.

🏗️ System Architecture

The platform follows a layered architecture in which each component is responsible for a specific part of the application lifecycle.

                 USER / DEVELOPER
                         |
                         v
                REACT FRONTEND
          Dashboard | Applications
          Jobs | Logs | Metrics
                         |
                    REST API
                         |
                         v
               SPRING BOOT BACKEND
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
        Controllers   Services    Scheduler
             |           |           |
             +-----------+-----------+
                         |
                  +------+------+
                  |             |
                  v             v
              DAO LAYER    RUNTIME LAYER
                  |             |
                  v             v
             JDBC / SQL    DOCKER ENGINE
                  |             |
                  v             v
             MYSQL DB     APPLICATION
                           CONTAINERS

Architecture Components

1. React Frontend

The frontend provides a centralized dashboard for developers to interact with the platform.

* Dashboard and application overview
* Application creation and configuration
* Workload job management
* Deployment status and execution logs
* CPU and memory monitoring
* Environment variable management

2. Spring Boot Backend

The backend handles business logic, request processing, application management, and communication between the frontend, database, scheduler, and runtime layer.

Main controllers:

* AuthController — Authentication and user-related requests.
* ApplicationController — Application registration and lifecycle operations.
* ContainerController — Container management and runtime operations.

3. Service Layer

The service layer separates business logic from HTTP request handling and database access.

Service	Responsibility
UserService	User registration and authentication logic
ApplicationService	Application metadata and lifecycle management
WorkloadJobService	Workload job creation and tracking
SchedulerService	Scheduling and job selection
RuntimeService	Application execution and lifecycle operations
ContainerService	Docker container operations
EnvironmentVariableService	Application configuration
MonitoringService	Runtime metrics and log collection

4. DAO and Database Access Layer

The Data Access Object (DAO) layer separates database operations from business logic. JDBC and JdbcTemplate can be used for SQL queries and result mapping.

5. Scheduler

The scheduler selects pending workload jobs according to the configured CPU scheduling algorithm. This module demonstrates operating-system scheduling concepts in the context of workload management.

6. Runtime Layer

The runtime layer communicates with Docker to manage application containers and their lifecycle. It acts as an abstraction between the backend services and the container engine.

7. MySQL Database

MySQL provides persistent storage for users, applications, workload jobs, containers, and environment variables.

🛠️ Technology Stack

Component	Technology
Frontend	React.js, HTML, CSS, JavaScript
Backend	Java 21, Spring Boot
API Communication	HTTP / REST API
Database	MySQL
Database Access	JDBC, JdbcTemplate, handwritten SQL
Containerization	Docker
Scheduling	FCFS, SJF, SRTF, Round Robin, Priority
Build Tool	Maven
Version Control	Git and GitHub

🗄️ Database Schema

The platform uses five primary tables to maintain application and runtime metadata.

1. users

Stores user account information.

Field	Description
id	Unique user identifier
name	User’s name
email	Unique email address
password	Securely stored password hash
created_at	Account creation timestamp

2. applications

Stores registered backend application information.

Field	Description
id	Unique application identifier
name	Application name
repository_url	Git repository URL
branch	Source code branch
build_command	Application build command
start_command	Application startup command
status	Current application status
owner_id	Reference to the owning user

3. workload_jobs

Stores jobs submitted to the scheduling system.

Field	Description
id	Unique job identifier
application_id	Associated application
priority	Job priority
arrival_time	Job arrival time
burst_time	Estimated processing time
status	Current job status
scheduled_at	Scheduled execution time

4. containers

Stores container metadata and lifecycle information.

Field	Description
id	Unique container record
application_id	Associated application
container_id	Docker container identifier
port	Application port
status	Running, stopped, or other runtime state
created_at	Container creation timestamp

5. environment_variables

Stores application-specific configuration.

Field	Description
id	Unique configuration identifier
application_id	Associated application
key	Configuration variable name
value	Configuration value

Note: These tables represent the proposed logical schema. Adjust field names and relationships to match the actual database implementation.

⚙️ CPU Scheduling Algorithms

The platform incorporates CPU scheduling algorithms to demonstrate how workloads can be selected and ordered for execution.

Algorithm	Description
FCFS	First Come, First Served — executes jobs in arrival order.
SJF	Shortest Job First — selects the job with the shortest estimated burst time.
SRTF	Shortest Remaining Time First — selects the job with the shortest remaining processing time.
Round Robin	Allocates a fixed time quantum to each eligible job in rotation.
Priority Scheduling	Selects jobs according to their assigned priority.

These algorithms provide a scheduling simulation for understanding workload ordering and execution policies. They should not be interpreted as equivalent to Docker’s internal CPU scheduler.

🔄 Application Deployment Workflow

1. Register: A developer creates an account and logs in.
2. Add application: The developer registers an application and supplies its Git repository, branch, and build/start commands.
3. Configure: Application settings and environment variables are stored.
4. Create workload: A deployment or execution job is submitted to the workload scheduler.
5. Schedule: The selected scheduling algorithm determines the next eligible job.
6. Build and run: The runtime layer invokes Docker to build and start the application container.
7. Monitor: The dashboard retrieves application status, runtime information, logs, and available resource metrics.
8. Manage: The developer can stop, restart, or otherwise manage the application through the dashboard.

📂 Project Structure

The following is a suggested organization for the repository. Update it to match the actual project structure.

backend-hosting-management-platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/platform/
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── dao/
│   │   │   │       ├── scheduler/
│   │   │   │       ├── runtime/
│   │   │   │       ├── model/
│   │   │   │       └── config/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md

🚀 Getting Started

Prerequisites

Install the following tools before running the project:

* Java Development Kit (JDK) 21
* Maven
* Node.js and npm
* MySQL Server
* Docker Desktop or Docker Engine
* Git

1. Clone the Repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd backend-hosting-management-platform

Replace the placeholder with your actual GitHub repository URL.

2. Configure MySQL

Start your MySQL server and create the database:

CREATE DATABASE backend_platform;

Configure the connection using environment variables or your local application configuration.

Example application.properties:

spring.application.name=backend-hosting-management-platform
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/backend_platform}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
server.port=8080

Set DB_USERNAME and DB_PASSWORD in your local environment before starting the backend. Do not commit database credentials to GitHub.

If your project uses handwritten SQL and JDBC, ensure that the required MySQL JDBC driver and Spring JDBC dependencies are configured in pom.xml.

3. Start the Backend

Open a terminal in the backend directory:

cd backend
mvn clean install
mvn spring-boot:run

The backend should be available at:

http://localhost:8080

The exact API endpoints depend on the implemented controllers.

4. Start the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Open the local development URL printed by Vite in your terminal.

5. Verify Docker

Ensure Docker is installed and running:

docker --version
docker info

The Docker runtime features will work only when the backend has been configured to communicate with the Docker engine and the necessary permissions are available.

🔌 REST API Design

The following endpoints are suggested examples of the intended API design. Implemented routes may differ.

Method	Endpoint	Purpose
POST	/api/auth/register	Register a user
POST	/api/auth/login	Authenticate a user
GET	/api/applications	List applications
POST	/api/applications	Register an application
GET	/api/applications/{id}	Retrieve application details
POST	/api/applications/{id}/deploy	Submit a deployment job
POST	/api/applications/{id}/start	Start an application
POST	/api/applications/{id}/stop	Stop an application
POST	/api/applications/{id}/restart	Restart an application
GET	/api/jobs	Retrieve workload jobs
GET	/api/applications/{id}/logs	Retrieve application logs
GET	/api/applications/{id}/metrics	Retrieve available runtime metrics

🔐 Security Considerations

Security is an important part of a backend hosting platform because it can execute user-supplied application commands and manage runtime processes.

* Hash passwords using a suitable password-hashing algorithm.
* Authenticate requests and enforce application ownership checks.
* Validate repository URLs, build commands, ports, and configuration values.
* Keep credentials and secrets out of source control and application logs.
* Restrict Docker engine access to trusted backend components.
* Apply container resource limits and appropriate network restrictions.
* Avoid exposing the Docker socket or unrestricted host command execution to users.
* Use HTTPS and appropriate access controls when deploying beyond localhost.

🧪 Testing

Recommended testing areas include:

* Authentication and input validation
* Application registration and lifecycle transitions
* SQL query correctness and database relationships
* Scheduling algorithm output and execution order
* Docker container creation, startup, stopping, and restart behavior
* Log retrieval and metric collection
* Error handling when the database, Docker engine, or application is unavailable

🎯 Project Objectives

* Simplify backend application hosting through a unified dashboard.
* Demonstrate operating-system process and workload management concepts.
* Apply CPU scheduling algorithms to workload scheduling.
* Use relational database design to maintain application metadata.
* Integrate container-based runtime management.
* Explore monitoring, REST API design, and automated deployment workflows.

🔮 Future Enhancements

* GitHub webhook integration for automatic redeployment.
* Advanced monitoring with historical CPU and memory graphs.
* Application health checks and automatic restart policies.
* Custom domains and HTTPS configuration.
* Role-based access control.
* Resource quotas and per-user application limits.
* Scheduling policies based on priority, deadlines, and resource requirements.
* Deployment history and rollback support.
* Production-ready authentication, audit logging, and security hardening.

👥 Contributors

Add the project team members and their GitHub profiles here.

* Utkarsh Shukla
* Sarabjeet Singh
* Maninder Kaur
* Riddhi Jain

📚 References

* Spring Boot Documentation
* React Documentation
* MySQL Documentation
* Docker Documentation
* Spring REST Guide

📄 License

This project is developed for educational and academic purposes. Add a LICENSE file if you intend to distribute it under a specific open-source license.
