package com.backend.dao;

import com.backend.model.Application;
import com.backend.model.Container;
import com.backend.model.Deployment;
import com.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Timestamp;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ContainerDaoTest {

    @Autowired
    private ContainerDao containerDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ApplicationDao applicationDao;

    @Autowired
    private DeploymentDao deploymentDao;

    private Long createTestUser() {

        User user = new User();

        user.setName("Container Test User");
        user.setEmail(
                "container" + System.nanoTime() + "@test.com");
        user.setPassword("password");

        userDao.createUser(user);

        return userDao.findByEmail(user.getEmail()).getId();
    }

    private Long createTestApplication() {

        Long userId = createTestUser();

        Application application = new Application();

        application.setUserId(userId);
        application.setName(
                "container-app-" + System.nanoTime());
        application.setRepositoryUrl(
                "https://github.com/test/container");
        application.setBranch("main");
        application.setBuildCommand("docker build .");
        application.setStartCommand("docker run app");
        application.setStatus("CREATED");

        applicationDao.createApplication(application);

        return applicationDao
                .findByUserId(userId)
                .get(0)
                .getId();
    }

    private Long createTestDeployment(Long applicationId) {

        Deployment deployment = new Deployment();

        deployment.setApplicationId(applicationId);
        deployment.setCommitHash("container123");
        deployment.setStatus("DEPLOYED");

        deploymentDao.createDeployment(deployment);

        return deploymentDao
                .findByApplicationId(applicationId)
                .get(0)
                .getId();
    }

    private Long createTestContainer() {

        Long applicationId = createTestApplication();

        Long deploymentId = createTestDeployment(applicationId);

        Container container = new Container();

        container.setApplicationId(applicationId);
        container.setDeploymentId(deploymentId);
        container.setDockerContainerId(
                "docker-" + System.nanoTime());
        container.setImageName("test-app:latest");
        container.setStatus("CREATED");
        container.setHostPort(8081);
        container.setContainerPort(8080);

        containerDao.createContainer(container);

        return containerDao
                .findByApplicationId(applicationId)
                .get(0)
                .getId();
    }

    @Test
    void createAndFindContainer() {

        Long applicationId = createTestApplication();

        Long deploymentId = createTestDeployment(applicationId);

        Container container = new Container();

        container.setApplicationId(applicationId);
        container.setDeploymentId(deploymentId);
        container.setDockerContainerId(
                "docker-" + System.nanoTime());
        container.setImageName("test-app:latest");
        container.setStatus("CREATED");
        container.setHostPort(8081);
        container.setContainerPort(8080);

        int rows = containerDao.createContainer(container);

        assertEquals(1, rows);

        Container saved = containerDao
                .findByApplicationId(applicationId)
                .get(0);

        assertNotNull(saved);
        assertEquals(applicationId, saved.getApplicationId());
        assertEquals(deploymentId, saved.getDeploymentId());
        assertEquals("test-app:latest", saved.getImageName());
        assertEquals("CREATED", saved.getStatus());
        assertEquals(8081, saved.getHostPort());
        assertEquals(8080, saved.getContainerPort());
    }

    @Test
    void findContainerById() {

        Long containerId = createTestContainer();

        Container container = containerDao.findById(containerId);

        assertNotNull(container);
        assertEquals(containerId, container.getId());
    }

    @Test
    void findContainerByDockerId() {

        Long applicationId = createTestApplication();
        Long deploymentId = createTestDeployment(applicationId);

        String dockerId = "docker-" + System.nanoTime();

        Container container = new Container();

        container.setApplicationId(applicationId);
        container.setDeploymentId(deploymentId);
        container.setDockerContainerId(dockerId);
        container.setImageName("test-image");
        container.setStatus("CREATED");
        container.setHostPort(8082);
        container.setContainerPort(8080);

        containerDao.createContainer(container);

        Container saved = containerDao.findByDockerContainerId(dockerId);

        assertNotNull(saved);
        assertEquals(dockerId, saved.getDockerContainerId());
    }

    @Test
    void findContainersByApplicationId() {

        Long applicationId = createTestApplication();
        Long deploymentId = createTestDeployment(applicationId);

        Container container1 = createContainer(
                applicationId,
                deploymentId,
                "image-one:latest");

        Container container2 = createContainer(
                applicationId,
                deploymentId,
                "image-two:latest");

        containerDao.createContainer(container1);
        containerDao.createContainer(container2);

        List<Container> containers = containerDao.findByApplicationId(applicationId);

        assertEquals(2, containers.size());
    }

    @Test
    void findContainersByDeploymentId() {

        Long applicationId = createTestApplication();
        Long deploymentId = createTestDeployment(applicationId);

        Container container = createContainer(
                applicationId,
                deploymentId,
                "deployment-image:latest");

        containerDao.createContainer(container);

        List<Container> containers = containerDao.findByDeploymentId(deploymentId);

        assertEquals(1, containers.size());
        assertEquals(
                deploymentId,
                containers.get(0).getDeploymentId());
    }

    @Test
    void findRunningContainerByApplicationId() {

        Long applicationId = createTestApplication();
        Long deploymentId = createTestDeployment(applicationId);

        Container container = createContainer(
                applicationId,
                deploymentId,
                "running-image:latest");

        container.setStatus("RUNNING");

        containerDao.createContainer(container);

        Container running = containerDao
                .findRunningByApplicationId(applicationId);

        assertNotNull(running);
        assertEquals("RUNNING", running.getStatus());
    }

    @Test
    void updateContainerStatus() {

        Long containerId = createTestContainer();

        int rows = containerDao.updateStatus(
                containerId,
                "STARTING");

        assertEquals(1, rows);

        Container container = containerDao.findById(containerId);

        assertEquals("STARTING", container.getStatus());
    }

    @Test
    void markContainerStarted() {

        Long containerId = createTestContainer();

        Timestamp startTime = new Timestamp(System.currentTimeMillis());

        int rows = containerDao.markStarted(
                containerId,
                startTime);

        assertEquals(1, rows);

        Container container = containerDao.findById(containerId);

        assertEquals("RUNNING", container.getStatus());
        assertNotNull(container.getStartedAt());
    }

    @Test
    void markContainerStopped() {

        Long containerId = createTestContainer();

        Timestamp stopTime = new Timestamp(System.currentTimeMillis());

        int rows = containerDao.markStopped(
                containerId,
                stopTime);

        assertEquals(1, rows);

        Container container = containerDao.findById(containerId);

        assertEquals("STOPPED", container.getStatus());
        assertNotNull(container.getStoppedAt());
    }

    @Test
    void markContainerCrashed() {

        Long containerId = createTestContainer();

        int rows = containerDao.markCrashed(containerId);

        assertEquals(1, rows);

        Container container = containerDao.findById(containerId);

        assertEquals("CRASHED", container.getStatus());
    }

    @Test
    void deleteContainer() {

        Long containerId = createTestContainer();

        int rows = containerDao.deleteContainer(containerId);

        assertEquals(1, rows);

        assertThrows(
                Exception.class,
                () -> containerDao.findById(containerId));
    }

    private Container createContainer(
            Long applicationId,
            Long deploymentId,
            String imageName) {

        Container container = new Container();

        container.setApplicationId(applicationId);
        container.setDeploymentId(deploymentId);
        container.setDockerContainerId(
                "docker-" + System.nanoTime());
        container.setImageName(imageName);
        container.setStatus("CREATED");
        container.setHostPort(
                8000 + (int) (Math.random() * 1000));
        container.setContainerPort(8080);

        return container;
    }
}