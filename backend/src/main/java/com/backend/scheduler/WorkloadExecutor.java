package com.backend.scheduler;

import com.backend.git.GitService;
import com.backend.model.Application;
import com.backend.model.Container;
import com.backend.model.WorkloadJob;
import com.backend.runtime.Runtime;
import com.backend.service.ApplicationService;
import com.backend.service.ContainerService;
import com.backend.service.EnvironmentVariableService;
import com.backend.service.WorkloadJobService;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.ServerSocket;

import java.sql.Timestamp;

@Service
public class WorkloadExecutor {

    private static final Logger logger = LoggerFactory.getLogger(WorkloadExecutor.class);

    private final WorkloadJobService jobService;
    private final ApplicationService applicationService;
    private final ContainerService containerService;
    private final EnvironmentVariableService environmentVariableService;
    private final GitService gitService;
    private final Runtime runtime;

    public WorkloadExecutor(
            WorkloadJobService jobService,
            ApplicationService applicationService,
            ContainerService containerService,
            EnvironmentVariableService environmentVariableService,
            GitService gitService,
            Runtime runtime) {

        this.jobService = jobService;
        this.applicationService = applicationService;
        this.containerService = containerService;
        this.environmentVariableService = environmentVariableService;
        this.gitService = gitService;
        this.runtime = runtime;
    }

    public void execute(WorkloadJob job) {

        if ("DEPLOY".equals(job.getJobType())) {
            deploy(job);
        } else if ("RESTART".equals(job.getJobType())) {
            restart(job);
        } else {
            logger.error("Unsupported workload job type '{}' for job {}", job.getJobType(), job.getId());
            jobService.failJob(job.getId());
        }
    }

    private void deploy(WorkloadJob job) {

        Application app = applicationService.findById(
                job.getApplicationId());

        try {
            applicationService.updateStatus(
                    app.getId(), "DEPLOYING");

            jobService.startJob(job.getId());

            // clone repo
            String path = gitService.cloneRepository(
                    app.getId(),
                    app.getRepositoryUrl(),
                    app.getBranch());

            String imageName = "hostex-app-" + app.getId();

            runtime.buildImage(
                    path,
                    imageName);

            int containerPort = resolveContainerPort(app, imageName);
            int hostPort = findAvailablePort();

            double cpuLimit;
            int memoryLimitMb;

            switch (app.getPlan()) {
                case "BASIC" -> {
                    cpuLimit = 0.5;
                    memoryLimitMb = 512;
                }
                case "STANDARD" -> {
                    cpuLimit = 1.0;
                    memoryLimitMb = 1024;
                }
                case "PREMIUM" -> {
                    cpuLimit = 2.0;
                    memoryLimitMb = 2048;
                }
                default -> throw new IllegalArgumentException(
                        "Invalid hosting plan: " + app.getPlan());
            }

            String dockerId = runtime.createContainer(
                    imageName,
                    hostPort,
                    containerPort,
                    cpuLimit,
                    memoryLimitMb,
                    app.getStartCommand(),
                    environmentVariableService.findByApplicationId(app.getId()));

            runtime.startContainer(dockerId);

            String containerStatus = runtime.getContainerStatus(dockerId);
            if (!"running".equalsIgnoreCase(containerStatus)) {
                throw new IllegalStateException(
                        "Container exited during startup with status '" + containerStatus
                                + "'. Check the start command and container port.");
            }

            Container container = new Container();

            container.setApplicationId(app.getId());
            container.setDockerContainerId(dockerId);
            container.setImageName(imageName);
            container.setStatus("RUNNING");
            container.setHostPort(hostPort);
            container.setContainerPort(containerPort);

            Timestamp now = new Timestamp(
                    System.currentTimeMillis());

            container.setCreatedAt(now);
            container.setStartedAt(now);

            containerService.createContainer(container);

            applicationService.updateStatus(
                    app.getId(), "RUNNING");

            System.out.println("\nApp started");

            jobService.completeJob(job.getId());

        } catch (Exception e) {

            applicationService.updateStatus(
                    app.getId(), "FAILED");

            jobService.failJob(job.getId());

            logger.error("Deployment job {} failed for application {}", job.getId(), app.getId(), e);
        }
    }

    private void restart(WorkloadJob job) {

        Application app = applicationService.findById(
                job.getApplicationId());

        try {
            jobService.startJob(job.getId());

            Container container = containerService
                    .findByApplicationId(app.getId())
                    .get(0);

            containerService.restartContainer(
                    container.getId());

            applicationService.updateStatus(
                    app.getId(), "RUNNING");

            jobService.completeJob(job.getId());

        } catch (Exception e) {

            jobService.failJob(job.getId());
            logger.error("Restart job {} failed for application {}", job.getId(), app.getId(), e);
            throw e;
        }
    }

    private int findAvailablePort() throws IOException {

        try (ServerSocket socket = new ServerSocket(0)) {
            return socket.getLocalPort();
        }
    }

    private int resolveContainerPort(Application app, String imageName) {
        var exposedPorts = runtime.getExposedPorts(imageName);
        if (exposedPorts.isEmpty() || exposedPorts.contains(app.getContainerPort())) {
            return app.getContainerPort();
        }
        if (exposedPorts.size() == 1) {
            int detectedPort = exposedPorts.get(0);
            logger.warn(
                    "Application {} configured for container port {}, but image {} exposes port {}; using the image port",
                    app.getId(), app.getContainerPort(), imageName, detectedPort);
            return detectedPort;
        }
        throw new IllegalArgumentException(
                "Configured container port " + app.getContainerPort()
                        + " is not exposed by image " + imageName
                        + "; available ports are " + exposedPorts);
    }
}