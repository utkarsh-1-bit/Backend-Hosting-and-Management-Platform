package com.backend.service;

import com.backend.dao.ContainerDao;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Container;
import com.backend.runtime.Runtime;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ContainerService {

    private final ContainerDao containerDao;
    private final Runtime runtime;

    public ContainerService(
            ContainerDao containerDao,
            Runtime runtime) {

        this.containerDao = containerDao;
        this.runtime = runtime;
    }

    public Container createContainer(Container container) {

        Long id = containerDao.createContainer(container);

        return findById(id);
    }

    public Container findById(Long id) {

        Container container = containerDao.findById(id);

        if (container == null) {
            throw new ResourceNotFoundException(
                    "Container not found");
        }

        return container;
    }

    public List<Container> findByApplicationId(
            Long applicationId) {

        return containerDao.findByApplicationId(
                applicationId);
    }

    public Container findRunningByApplicationId(
            Long applicationId) {

        Container container = containerDao.findRunningByApplicationId(
                applicationId);

        if (container == null) {
            throw new ResourceNotFoundException(
                    "Running container not found");
        }

        return container;
    }

    public void startContainer(Long id) {

        Container container = findById(id);

        runtime.startContainer(
                container.getDockerContainerId());

        containerDao.markStarted(
                id,
                new Timestamp(
                        System.currentTimeMillis()));
    }

    public void stopContainer(Long id) {

        Container container = findById(id);

        runtime.stopContainer(
                container.getDockerContainerId());

        containerDao.markStopped(
                id,
                new Timestamp(
                        System.currentTimeMillis()));
    }

    public void removeContainer(Long id) {

        Container container = findById(id);

        runtime.removeContainer(
                container.getDockerContainerId());

        containerDao.deleteContainer(id);
    }
}