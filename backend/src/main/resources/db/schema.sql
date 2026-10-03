CREATE table users(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name varchar(100) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULl,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    repository_url VARCHAR(500) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    build_command VARCHAR(500),
    start_command VARCHAR(500),
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_applications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE TABLE deployments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    commit_hash VARCHAR(64),
    status VARCHAR(30) NOT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    error_message TEXT,

    CONSTRAINT fk_deployments_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
);

CREATE TABLE workload_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    deployment_id BIGINT NULL,
    job_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    priority INT DEFAULT 0,
    arrival_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    burst_time INT,
    start_time TIMESTAMP NULL,
    completion_time TIMESTAMP NULL,

    CONSTRAINT fk_jobs_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id),

    CONSTRAINT fk_jobs_deployment
        FOREIGN KEY (deployment_id)
        REFERENCES deployments(id)
);

CREATE TABLE containers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    deployment_id BIGINT NOT NULL,
    docker_container_id VARCHAR(100) NOT NULL UNIQUE,
    image_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL,
    host_port INT,
    container_port INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    stopped_at TIMESTAMP NULL,

    CONSTRAINT fk_containers_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id),

    CONSTRAINT fk_containers_deployment
        FOREIGN KEY (deployment_id)
        REFERENCES deployments(id)
);

CREATE TABLE environment_variables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    variable_key VARCHAR(100) NOT NULL,
    variable_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_env_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id),

    CONSTRAINT uq_application_variable
        UNIQUE (application_id, variable_key)
);