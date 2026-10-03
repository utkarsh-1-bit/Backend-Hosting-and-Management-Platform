package com.backend.dao;

import com.backend.model.Application;
import com.backend.model.Deployment;
import com.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DeploymentDaoTest {

    @Autowired
    private DeploymentDao deploymentDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ApplicationDao applicationDao;

    private Long createTestUser() {

        User user = new User();

        user.setName("Deployment Test User");
        user.setEmail("deployment" + System.nanoTime() + "@test.com");
        user.setPassword("password");

        userDao.createUser(user);

        return userDao.findByEmail(user.getEmail()).getId();
    }

    private Long createTestApplication() {

        Long userId = createTestUser();

        Application application = new Application();

        application.setUserId(userId);
        application.setName("deployment-app-" + System.nanoTime());
        application.setRepositoryUrl("https://github.com/test/demo");
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

    private Long createTestDeployment() {

        Long applicationId = createTestApplication();

        Deployment deployment = new Deployment();

        deployment.setApplicationId(applicationId);
        deployment.setCommitHash("abc123");
        deployment.setStatus("QUEUED");

        deploymentDao.createDeployment(deployment);

        return deploymentDao
                .findByApplicationId(applicationId)
                .get(0)
                .getId();
    }

    @Test
    void createAndFindDeployment() {

        Long applicationId = createTestApplication();

        Deployment deployment = new Deployment();

        deployment.setApplicationId(applicationId);
        deployment.setCommitHash("commit123");
        deployment.setStatus("QUEUED");

        int rows = deploymentDao.createDeployment(deployment);

        assertEquals(1, rows);

        Deployment saved = deploymentDao.findByApplicationId(applicationId).get(0);

        assertNotNull(saved);
        assertEquals(applicationId, saved.getApplicationId());
        assertEquals("commit123", saved.getCommitHash());
        assertEquals("QUEUED", saved.getStatus());
    }

    @Test
    void findDeploymentById() {

        Long deploymentId = createTestDeployment();

        Deployment deployment = deploymentDao.findById(deploymentId);

        assertNotNull(deployment);
        assertEquals(deploymentId, deployment.getId());
    }

    @Test
    void findDeploymentsByApplicationId() {

        Long applicationId = createTestApplication();

        Deployment deployment1 = new Deployment();
        deployment1.setApplicationId(applicationId);
        deployment1.setCommitHash("commit1");
        deployment1.setStatus("QUEUED");

        Deployment deployment2 = new Deployment();
        deployment2.setApplicationId(applicationId);
        deployment2.setCommitHash("commit2");
        deployment2.setStatus("QUEUED");

        deploymentDao.createDeployment(deployment1);
        deploymentDao.createDeployment(deployment2);

        List<Deployment> deployments = deploymentDao.findByApplicationId(applicationId);

        assertEquals(2, deployments.size());
    }

    @Test
    void findLatestDeploymentByApplicationId() {

        Long applicationId = createTestApplication();

        Deployment deployment1 = new Deployment();
        deployment1.setApplicationId(applicationId);
        deployment1.setCommitHash("oldcommit");
        deployment1.setStatus("FAILED");

        Deployment deployment2 = new Deployment();
        deployment2.setApplicationId(applicationId);
        deployment2.setCommitHash("newcommit");
        deployment2.setStatus("QUEUED");

        deploymentDao.createDeployment(deployment1);
        deploymentDao.createDeployment(deployment2);

        Deployment latest = deploymentDao.findLatestByApplicationId(applicationId);

        assertEquals("newcommit", latest.getCommitHash());
    }

    @Test
    void updateDeploymentStatus() {

        Long deploymentId = createTestDeployment();

        int rows = deploymentDao.updateStatus(
                deploymentId,
                "BUILDING");

        assertEquals(1, rows);

        Deployment deployment = deploymentDao.findById(deploymentId);

        assertEquals("BUILDING", deployment.getStatus());
    }

    @Test
    void markDeploymentFailed() {

        Long deploymentId = createTestDeployment();

        int rows = deploymentDao.markFailed(
                deploymentId,
                "Docker build failed");

        assertEquals(1, rows);

        Deployment deployment = deploymentDao.findById(deploymentId);

        assertEquals("FAILED", deployment.getStatus());
        assertEquals(
                "Docker build failed",
                deployment.getErrorMessage());
        assertNotNull(deployment.getCompletedAt());
    }

    @Test
    void deleteDeployment() {

        Long applicationId = createTestApplication();

        Deployment deployment = new Deployment();

        deployment.setApplicationId(applicationId);
        deployment.setCommitHash("delete-test");
        deployment.setStatus("QUEUED");

        deploymentDao.createDeployment(deployment);

        Long deploymentId = deploymentDao
                .findByApplicationId(applicationId)
                .get(0)
                .getId();

        int rows = deploymentDao.deleteDeployment(deploymentId);

        assertEquals(1, rows);

        assertThrows(
                Exception.class,
                () -> deploymentDao.findById(deploymentId));
    }
}