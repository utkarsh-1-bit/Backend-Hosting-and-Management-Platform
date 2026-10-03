package com.backend.dao;

import com.backend.model.Application;
import com.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ApplicationDaoTest {

    @Autowired
    private ApplicationDao applicationDao;

    @Autowired
    private UserDao userDao;

    private User createTestUser(String email) {

        User user = new User();

        user.setName("Application Test User");
        user.setEmail(email);
        user.setPassword("test123");

        userDao.createUser(user);

        return userDao.findByEmail(email);
    }

    private Application createTestApplication(Long userId, String name) {

        Application application = new Application();

        application.setUserId(userId);
        application.setName(name);
        application.setRepositoryUrl("https://github.com/test/app");
        application.setBranch("main");
        application.setBuildCommand("npm install");
        application.setStartCommand("npm start");
        application.setStatus("CREATED");

        applicationDao.createApplication(application);

        return applicationDao.findByUserId(userId)
                .stream()
                .filter(app -> app.getName().equals(name))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void createAndFindApplication() {

        User user = createTestUser("app-create@example.com");

        Application application = createTestApplication(user.getId(), "create-test");

        assertNotNull(application);
        assertEquals(user.getId(), application.getUserId());
        assertEquals("create-test", application.getName());
    }

    @Test
    void findApplicationById() {

        User user = createTestUser("app-find@example.com");

        Application created = createTestApplication(user.getId(), "find-test");

        Application found = applicationDao.findById(created.getId());

        assertNotNull(found);
        assertEquals(created.getId(), found.getId());
        assertEquals("find-test", found.getName());
    }

    @Test
    void findApplicationsByUserId() {

        User user = createTestUser("app-list@example.com");

        createTestApplication(user.getId(), "app-one");
        createTestApplication(user.getId(), "app-two");

        List<Application> applications = applicationDao.findByUserId(user.getId());

        assertTrue(applications.size() >= 2);
    }

    @Test
    void updateApplication() {

        User user = createTestUser("app-update@example.com");

        Application application = createTestApplication(user.getId(), "before-update");

        application.setName("after-update");
        application.setBranch("develop");

        int rows = applicationDao.updateApplication(application);

        assertEquals(1, rows);

        Application updated = applicationDao.findById(application.getId());

        assertEquals("after-update", updated.getName());
        assertEquals("develop", updated.getBranch());
    }

    @Test
    void updateStatus() {

        User user = createTestUser("app-status@example.com");

        Application application = createTestApplication(user.getId(), "status-test");

        int rows = applicationDao.updateStatus(application.getId(), "RUNNING");

        assertEquals(1, rows);

        Application updated = applicationDao.findById(application.getId());

        assertEquals("RUNNING", updated.getStatus());
    }

    @Test
    void applicationNameExistsForUser() {

        User user = createTestUser("app-exists@example.com");

        createTestApplication(user.getId(), "unique-app");

        assertTrue(
                applicationDao.existsByNameForUser(
                        user.getId(),
                        "unique-app"));

        assertFalse(
                applicationDao.existsByNameForUser(
                        user.getId(),
                        "does-not-exist"));
    }

    @Test
    void deleteApplication() {

        User user = createTestUser("app-delete@example.com");

        Application application = createTestApplication(user.getId(), "delete-test");

        int rows = applicationDao.deleteApplication(application.getId());

        assertEquals(1, rows);

        List<Application> applications = applicationDao.findByUserId(user.getId());

        assertTrue(
                applications.stream()
                        .noneMatch(app -> app.getId().equals(application.getId())));
    }
}