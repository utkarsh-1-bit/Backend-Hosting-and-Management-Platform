package com.backend.service;

import com.backend.controller.dto.ApplicationResponse;
import com.backend.dao.ApplicationDao;
import com.backend.runtime.Runtime;
import com.backend.model.Application;
import com.backend.model.Container;
import com.backend.model.EnvironmentVariable;
import com.backend.model.WorkloadJob;

import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.git.GitService;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApplicationService {

    private final ApplicationDao applicationDao;
    private final WorkloadJobService jobService;
    private final ContainerService containerService;
    private final EnvironmentVariableService variableService;
    private final Runtime runtime;
    private final GitService gitService;

    public ApplicationService(
            ApplicationDao applicationDao,
            WorkloadJobService jobService,
            ContainerService containerService,
            EnvironmentVariableService variableService,
            Runtime runtime,
            GitService gitService) {

        this.applicationDao = applicationDao;
        this.jobService = jobService;
        this.containerService = containerService;
        this.variableService = variableService;
        this.runtime = runtime;
        this.gitService = gitService;
    }

    public Application createApplication(
            Application application) {

        if (application == null ||
                application.getUserId() == null ||
                application.getName() == null ||
                application.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid application data");
        }

        if (applicationDao.existsByNameForUser(
                application.getUserId(),
                application.getName())) {

            throw new DuplicateResourceException(
                    "Application name already exists");
        }

        if (application.getPlan() == null ||
                !List.of("BASIC", "STANDARD", "PREMIUM")
                        .contains(application.getPlan().toUpperCase())) {
            throw new IllegalArgumentException("Invalid hosting plan");
        }

        application.setPlan(application.getPlan().toUpperCase());

        application.setStatus("CREATED");

        Long id = applicationDao.createApplication(
                application);

        return findById(id);
    }

    public ApplicationResponse getApplication(Long id) {
        Application application = findById(id);

        ApplicationResponse response = new ApplicationResponse();

        response.setId(application.getId());
        response.setName(application.getName());
        response.setStatus(application.getStatus());

        if ("RUNNING".equals(application.getStatus())) {

            Container container = containerService.findRunningByApplicationId(id);

            if (container != null && container.getHostPort() != null) {
                response.setUrl("http://localhost:" + container.getHostPort());
            }
        }

        return response;
    }

    public Application findById(Long id) {

        Application application = applicationDao.findById(id);

        if (application == null) {
            throw new ResourceNotFoundException(
                    "Application not found");
        }

        return application;
    }

    public List<Application> findByUserId(Long userId) {

        return applicationDao.findByUserId(userId);
    }

    public Application updateApplication(
            Application application) {

        findById(application.getId());

        applicationDao.updateApplication(
                application);

        return findById(application.getId());
    }

    public void deleteApplication(Long id) {

        Application application = findById(id);

        if ("DEPLOYING".equals(application.getStatus())) {
            throw new IllegalStateException(
                    "Cannot delete an application while deploying");
        }

        // remove containers
        List<Container> containers = containerService.findByApplicationId(id);

        for (Container container : containers) {

            if ("RUNNING".equals(container.getStatus())) {
                containerService.stopContainer(container.getId());
            }

            containerService.removeContainer(container.getId());
        }

        // Delete environment variables
        List<EnvironmentVariable> variables = variableService.findByApplicationId(id);

        for (EnvironmentVariable variable : variables) {
            variableService.deleteById(variable.getId());
        }

        // Delete workload jobs
        List<WorkloadJob> jobs = jobService.findByApplicationId(id);

        for (WorkloadJob job : jobs) {
            jobService.deleteJob(job.getId());
        }

        // Remove application image
        runtime.removeImage("hostex-app-" + id);

        // Delete the application record
        applicationDao.deleteApplication(id);

        // Delete the workspace
        gitService.deleteWorkspace(id);
    }

    public void updateStatus(Long id, String newStatus) {

        applicationDao.updateStatus(
                id,
                newStatus);
    }

    public WorkloadJob deployApplication(Long id) {

        Application application = findById(id);

        if ("RUNNING".equals(application.getStatus())) {
            throw new IllegalStateException("Application is already running");
        }

        cleanupDeployment(id);

        WorkloadJob job = new WorkloadJob();

        job.setApplicationId(id);
        job.setJobType("DEPLOY");
        job.setPriority(1);
        job.setBurstTime(10);

        return jobService.createJob(job);
    }

    public String startApplication(Long id) {

        Application application = findById(id);

        if ("RUNNING".equals(application.getStatus())) {
            throw new IllegalStateException("Application is already running");
        }

        Container container = containerService.findByApplicationId(id).getFirst();

        if (container == null) {
            deployApplication(id);
            return "Application will start soon";
        } else {
            containerService.startContainer(container.getId());
            updateStatus(id, "RUNNING");
            return "Application is Running";
        }
    }

    public void stopApplication(Long id) {

        Application application = findById(id);

        if (!"RUNNING".equals(application.getStatus())) {
            throw new IllegalStateException(
                    "Application is not running");
        }

        Container container = containerService.findRunningByApplicationId(id);

        containerService.stopContainer(
                container.getId());

        updateStatus(id, "STOPPED");
    }

    public String restartApplication(Long id) {

        Application application = findById(id);

        if (!"STOPPED".equals(application.getStatus())) {
            throw new IllegalStateException(
                    "Application is not stopped");
        }
        try {
            Container container = containerService.findRunningByApplicationId(id);

            containerService.startContainer(
                    container.getId());

            updateStatus(id, "RUNNING");

            return "Application Restarted";
        } catch (Exception e) {
            throw e;
        }

    }

    public Map<String, String> getResourceUsage(Long applicationId) {

        Application application = findById(applicationId);

        Container container = containerService
                .findRunningByApplicationId(applicationId);

        if (container == null) {
            throw new IllegalStateException("Application is not running");
        }

        String output = runtime.getResourceUsage(
                container.getDockerContainerId());

        String[] values = output.split("\\|");

        Map<String, String> usage = new HashMap<>();
        usage.put("applicationId", String.valueOf(application.getId()));
        usage.put("cpuUsage", values[0]);
        usage.put("memoryUsage", values[1]);
        usage.put("memoryPercentage", values[2]);

        return usage;
    }

    public String getApplicationLogs(Long applicationId) {

        findById(applicationId);

        Container container = containerService
                .findByApplicationId(applicationId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No container found for this application"));

        return runtime.getLogs(container.getDockerContainerId());
    }

    private void cleanupDeployment(Long applicationId) {

        List<Container> containers = containerService.findByApplicationId(applicationId);

        for (Container container : containers) {

            if ("RUNNING".equals(container.getStatus())) {
                containerService.stopContainer(container.getId());
            }

            containerService.removeContainer(container.getId());
        }

        gitService.deleteWorkspace(applicationId);
    }
}