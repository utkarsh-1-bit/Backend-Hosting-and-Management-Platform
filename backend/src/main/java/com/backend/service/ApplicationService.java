package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Application;
import com.backend.model.Container;
import com.backend.model.WorkloadJob;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationDao applicationDao;
    private final WorkloadJobService jobService;
    private final ContainerService containerService;

    public ApplicationService(
            ApplicationDao applicationDao,
            WorkloadJobService jobService,
            ContainerService containerService) {

        this.applicationDao = applicationDao;
        this.jobService = jobService;
        this.containerService = containerService;
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

        application.setStatus("CREATED");

        Long id = applicationDao.createApplication(
                application);

        return findById(id);
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

        findById(id);

        applicationDao.deleteApplication(id);
    }

    public void updateStatus(
            Long id,
            String newStatus) {

        Application application = findById(id);

        String current = application.getStatus();

        boolean valid = ("CREATED".equals(current) &&
                "READY".equals(newStatus)) ||

                ("READY".equals(current) &&
                        "DEPLOYING".equals(newStatus))
                ||

                ("DEPLOYING".equals(current) &&
                        ("RUNNING".equals(newStatus) ||
                                "READY".equals(newStatus)))
                ||

                ("RUNNING".equals(current) &&
                        "STOPPED".equals(newStatus));

        if (!valid) {
            throw new IllegalStateException(
                    "Invalid application status change");
        }

        applicationDao.updateStatus(
                id,
                newStatus);
    }

    public WorkloadJob startApplication(Long id) {

        Application application = findById(id);

        if (!"READY".equals(application.getStatus())) {
            throw new IllegalStateException(
                    "Application is not ready");
        }

        WorkloadJob job = new WorkloadJob();

        job.setApplicationId(id);
        job.setJobType("DEPLOY");
        job.setPriority(1);
        job.setBurstTime(10);

        return jobService.createJob(job);
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

    public WorkloadJob restartApplication(Long id) {

        Application application = findById(id);

        if (!"STOPPED".equals(application.getStatus())) {
            throw new IllegalStateException(
                    "Application is not stopped");
        }

        WorkloadJob job = new WorkloadJob();

        job.setApplicationId(id);
        job.setJobType("RESTART");
        job.setPriority(1);
        job.setBurstTime(5);

        return jobService.createJob(job);
    }
}