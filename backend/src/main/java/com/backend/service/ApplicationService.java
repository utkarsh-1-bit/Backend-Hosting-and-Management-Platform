package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.InvalidStateTransitionException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Application;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationDao applicationDao;

    public ApplicationService(ApplicationDao applicationDao) {
        this.applicationDao = applicationDao;
    }

    public Application createApplication(Application application) {

        if (application == null) {
            throw new IllegalArgumentException("Application cannot be null");
        }

        if (application.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (application.getName() == null || application.getName().isBlank()) {
            throw new IllegalArgumentException("Application name is required");
        }

        if (application.getRepositoryUrl() == null ||
                application.getRepositoryUrl().isBlank()) {
            throw new IllegalArgumentException("Repository URL is required");
        }

        if (application.getBranch() == null ||
                application.getBranch().isBlank()) {
            throw new IllegalArgumentException("Branch is required");
        }

        boolean exists = applicationDao.existsByNameForUser(
                application.getUserId(),
                application.getName());

        if (exists) {
            throw new DuplicateResourceException(
                    "Application with this name already exists for the user");
        }

        Long applicationId = applicationDao.createApplication(application);

        return findById(applicationId);
    }

    public Application findById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException("Application ID is required");
        }

        Application application = applicationDao.findById(id);

        if (application == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: " + id);
        }

        return application;
    }

    public List<Application> findByUserId(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        return applicationDao.findByUserId(userId);
    }

    public List<Application> findAll() {
        return applicationDao.findAll();
    }

    public int updateApplication(Application application) {

        if (application == null) {
            throw new IllegalArgumentException("Application cannot be null");
        }

        if (application.getId() == null) {
            throw new IllegalArgumentException("Application ID is required");
        }

        if (application.getName() == null || application.getName().isBlank()) {
            throw new IllegalArgumentException("Application name is required");
        }

        if (application.getRepositoryUrl() == null ||
                application.getRepositoryUrl().isBlank()) {
            throw new IllegalArgumentException("Repository URL is required");
        }

        if (application.getBranch() == null ||
                application.getBranch().isBlank()) {
            throw new IllegalArgumentException("Branch is required");
        }

        findById(application.getId());

        return applicationDao.updateApplication(application);
    }

    public int updateStatus(Long id, String newStatus) {

        if (id == null) {
            throw new IllegalArgumentException("Application ID is required");
        }

        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Application status is required");
        }

        Application application = findById(id);

        String currentStatus = application.getStatus();

        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new InvalidStateTransitionException(
                    "Invalid application state transition: "
                            + currentStatus + " -> " + newStatus);
        }

        return applicationDao.updateStatus(id, newStatus);
    }

    public int deleteApplication(Long id) {

        if (id == null) {
            throw new IllegalArgumentException("Application ID is required");
        }

        findById(id);

        return applicationDao.deleteApplication(id);
    }

    private boolean isValidStatusTransition(
            String currentStatus,
            String newStatus) {

        return switch (currentStatus) {

            case "CREATED" ->
                newStatus.equals("READY");

            case "READY" ->
                newStatus.equals("DEPLOYING");

            case "DEPLOYING" ->
                newStatus.equals("RUNNING");

            case "RUNNING" ->
                newStatus.equals("STOPPED");

            case "STOPPED" ->
                false;

            default ->
                false;
        };
    }

}
