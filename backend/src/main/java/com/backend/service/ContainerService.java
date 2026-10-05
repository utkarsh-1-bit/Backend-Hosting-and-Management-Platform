package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.dao.ContainerDao;
import com.backend.exception.InvalidStateTransitionException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Application;
import com.backend.model.Container;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ContainerService {

    private final ContainerDao containerDao;
    private final ApplicationDao applicationDao;

    public ContainerService(
            ContainerDao containerDao,
            ApplicationDao applicationDao) {

        this.containerDao = containerDao;
        this.applicationDao = applicationDao;
    }

    public int createContainer(Container container) {

        if (container == null) {
            throw new IllegalArgumentException(
                    "Container cannot be null");
        }

        if (container.getApplicationId() == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        if (container.getDockerContainerId() == null ||
                container.getDockerContainerId().isBlank()) {

            throw new IllegalArgumentException(
                    "Docker container ID is required");
        }

        if (container.getImageName() == null ||
                container.getImageName().isBlank()) {

            throw new IllegalArgumentException(
                    "Image name is required");
        }

        Application application = applicationDao.findById(
                container.getApplicationId());

        if (application == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: "
                            + container.getApplicationId());
        }

        if (containerDao.findByDockerContainerId(
                container.getDockerContainerId()) != null) {

            throw new IllegalArgumentException(
                    "Container already exists with Docker container ID: "
                            + container.getDockerContainerId());
        }

        if (container.getStatus() == null ||
                container.getStatus().isBlank()) {

            container.setStatus("CREATED");
        }

        return containerDao.createContainer(container);
    }

    public Container findById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Container ID is required");
        }

        Container container = containerDao.findById(id);

        if (container == null) {
            throw new ResourceNotFoundException(
                    "Container not found with id: " + id);
        }

        return container;
    }

    public Container findByDockerContainerId(
            String dockerContainerId) {

        if (dockerContainerId == null ||
                dockerContainerId.isBlank()) {

            throw new IllegalArgumentException(
                    "Docker container ID is required");
        }

        Container container = containerDao.findByDockerContainerId(
                dockerContainerId);

        if (container == null) {
            throw new ResourceNotFoundException(
                    "Container not found with Docker container ID: "
                            + dockerContainerId);
        }

        return container;
    }

    public List<Container> findByApplicationId(
            Long applicationId) {

        if (applicationId == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        if (applicationDao.findById(applicationId) == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: "
                            + applicationId);
        }

        return containerDao.findByApplicationId(applicationId);
    }

    public Container findRunningByApplicationId(
            Long applicationId) {

        if (applicationId == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        if (applicationDao.findById(applicationId) == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: "
                            + applicationId);
        }

        Container container = containerDao.findRunningByApplicationId(
                applicationId);

        if (container == null) {
            throw new ResourceNotFoundException(
                    "No running container found for application id: "
                            + applicationId);
        }

        return container;
    }

    public int updateStatus(
            Long id,
            String newStatus) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Container ID is required");
        }

        if (newStatus == null ||
                newStatus.isBlank()) {

            throw new IllegalArgumentException(
                    "Container status is required");
        }

        Container container = findById(id);

        validateStatusTransition(
                container.getStatus(),
                newStatus);

        return containerDao.updateStatus(
                id,
                newStatus);
    }

    public int markStarted(Long id) {

        Container container = findById(id);

        validateStatusTransition(
                container.getStatus(),
                "RUNNING");

        return containerDao.markStarted(
                id,
                new Timestamp(System.currentTimeMillis()));
    }

    public int markStopped(Long id) {

        Container container = findById(id);

        validateStatusTransition(
                container.getStatus(),
                "STOPPED");

        return containerDao.markStopped(
                id,
                new Timestamp(System.currentTimeMillis()));
    }

    public int markCrashed(Long id) {

        Container container = findById(id);

        validateStatusTransition(
                container.getStatus(),
                "CRASHED");

        return containerDao.markCrashed(id);
    }

    public int deleteContainer(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Container ID is required");
        }

        findById(id);

        return containerDao.deleteContainer(id);
    }

    private void validateStatusTransition(
            String currentStatus,
            String newStatus) {

        boolean valid = switch (currentStatus) {

            case "CREATED" ->
                newStatus.equals("RUNNING");

            case "RUNNING" ->
                newStatus.equals("STOPPED")
                        || newStatus.equals("CRASHED");

            case "STOPPED",
                    "CRASHED" ->
                false;

            default ->
                false;
        };

        if (!valid) {
            throw new InvalidStateTransitionException(
                    "Invalid container state transition: "
                            + currentStatus
                            + " -> "
                            + newStatus);
        }
    }
}