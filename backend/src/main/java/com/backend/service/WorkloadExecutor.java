package com.backend.service;

import com.backend.git.GitService;
import com.backend.model.Application;
import com.backend.model.Container;
import com.backend.model.WorkloadJob;
import com.backend.runtime.Runtime;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class WorkloadExecutor {

    private final WorkloadJobService jobService;
    private final ApplicationService applicationService;
    private final ContainerService containerService;
    private final GitService gitService;
    private final Runtime runtime;

    public WorkloadExecutor(
            WorkloadJobService jobService,
            ApplicationService applicationService,
            ContainerService containerService,
            GitService gitService,
            Runtime runtime) {

        this.jobService = jobService;
        this.applicationService = applicationService;
        this.containerService = containerService;
        this.gitService = gitService;
        this.runtime = runtime;
    }

    public void execute(WorkloadJob job) {

        if ("DEPLOY".equals(job.getJobType())) {
            deploy(job);
        } else if ("RESTART".equals(job.getJobType())) {
            restart(job);
        }
    }

    private void deploy(WorkloadJob job) {

        Application app = applicationService.findById(
                job.getApplicationId());

        try {
            applicationService.updateStatus(
                    app.getId(), "DEPLOYING");

            jobService.startJob(job.getId());

            String path = gitService.cloneRepository(
                    app.getRepositoryUrl(),
                    app.getBranch());

            String imageName = "mini-render-app-" + app.getId();

            runtime.buildImage(
                    path,
                    imageName);

            int hostPort = 8000 + app.getId().intValue();

            String dockerId = runtime.createContainer(
                    imageName,
                    hostPort,
                    8080);

            runtime.startContainer(dockerId);

            Container container = new Container();

            container.setApplicationId(app.getId());
            container.setDockerContainerId(dockerId);
            container.setImageName(imageName);
            container.setStatus("RUNNING");
            container.setHostPort(hostPort);
            container.setContainerPort(8080);

            Timestamp now = new Timestamp(
                    System.currentTimeMillis());

            container.setCreatedAt(now);
            container.setStartedAt(now);

            containerService.createContainer(container);

            applicationService.updateStatus(
                    app.getId(), "RUNNING");

            jobService.completeJob(job.getId());

        } catch (Exception e) {

            applicationService.updateStatus(
                    app.getId(), "READY");

            jobService.failJob(job.getId());

            throw e;
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

            containerService.startContainer(
                    container.getId());

            applicationService.updateStatus(
                    app.getId(), "RUNNING");

            jobService.completeJob(job.getId());

        } catch (Exception e) {

            jobService.failJob(job.getId());

            throw e;
        }
    }
}