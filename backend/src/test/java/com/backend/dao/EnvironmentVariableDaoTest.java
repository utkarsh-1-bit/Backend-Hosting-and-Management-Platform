package com.backend.dao;

import com.backend.model.Application;
import com.backend.model.EnvironmentVariable;
import com.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EnvironmentVariableDaoTest {

    @Autowired
    private EnvironmentVariableDao environmentVariableDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private ApplicationDao applicationDao;

    private Long createTestUser() {

        User user = new User();

        user.setName("Environment Test User");
        user.setEmail(
                "env" + System.nanoTime() + "@test.com");
        user.setPassword("password");

        userDao.createUser(user);

        return userDao.findByEmail(user.getEmail()).getId();
    }

    private Long createTestApplication() {

        Long userId = createTestUser();

        Application application = new Application();

        application.setUserId(userId);
        application.setName(
                "env-app-" + System.nanoTime());
        application.setRepositoryUrl(
                "https://github.com/test/env");
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

    private EnvironmentVariable createVariable(
            Long applicationId,
            String key,
            String value) {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setApplicationId(applicationId);
        variable.setVariableKey(key);
        variable.setVariableValue(value);

        return variable;
    }

    @Test
    void createAndFindVariable() {

        Long applicationId = createTestApplication();

        EnvironmentVariable variable = createVariable(
                applicationId,
                "DATABASE_URL",
                "mysql://localhost/test");

        int rows = environmentVariableDao
                .createVariable(variable);

        assertEquals(1, rows);

        EnvironmentVariable saved = environmentVariableDao.findByKey(
                applicationId,
                "DATABASE_URL");

        assertNotNull(saved);
        assertEquals(
                applicationId,
                saved.getApplicationId());
        assertEquals(
                "DATABASE_URL",
                saved.getVariableKey());
        assertEquals(
                "mysql://localhost/test",
                saved.getVariableValue());
    }

    @Test
    void findVariableById() {

        Long applicationId = createTestApplication();

        EnvironmentVariable variable = createVariable(
                applicationId,
                "API_KEY",
                "abc123");

        environmentVariableDao
                .createVariable(variable);

        EnvironmentVariable saved = environmentVariableDao.findByKey(
                applicationId,
                "API_KEY");

        EnvironmentVariable found = environmentVariableDao
                .findById(saved.getId());

        assertNotNull(found);
        assertEquals(
                saved.getId(),
                found.getId());
    }

    @Test
    void findVariableByKey() {

        Long applicationId = createTestApplication();

        EnvironmentVariable variable = createVariable(
                applicationId,
                "JWT_SECRET",
                "secret123");

        environmentVariableDao
                .createVariable(variable);

        EnvironmentVariable found = environmentVariableDao.findByKey(
                applicationId,
                "JWT_SECRET");

        assertNotNull(found);
        assertEquals(
                "secret123",
                found.getVariableValue());
    }

    @Test
    void findVariablesByApplicationId() {

        Long applicationId = createTestApplication();

        environmentVariableDao.createVariable(
                createVariable(
                        applicationId,
                        "DATABASE_URL",
                        "mysql://localhost"));

        environmentVariableDao.createVariable(
                createVariable(
                        applicationId,
                        "JWT_SECRET",
                        "secret"));

        List<EnvironmentVariable> variables = environmentVariableDao
                .findByApplicationId(applicationId);

        assertEquals(2, variables.size());
    }

    @Test
    void updateVariable() {

        Long applicationId = createTestApplication();

        EnvironmentVariable variable = createVariable(
                applicationId,
                "API_KEY",
                "old-value");

        environmentVariableDao
                .createVariable(variable);

        variable.setVariableValue("new-value");

        int rows = environmentVariableDao
                .updateVariable(variable);

        assertEquals(1, rows);

        EnvironmentVariable updated = environmentVariableDao.findByKey(
                applicationId,
                "API_KEY");

        assertEquals(
                "new-value",
                updated.getVariableValue());
    }

    @Test
    void variableExists() {

        Long applicationId = createTestApplication();

        environmentVariableDao.createVariable(
                createVariable(
                        applicationId,
                        "PORT",
                        "8080"));

        assertTrue(
                environmentVariableDao.existsByKey(
                        applicationId,
                        "PORT"));

        assertFalse(
                environmentVariableDao.existsByKey(
                        applicationId,
                        "NOT_EXISTS"));
    }

    @Test
    void deleteVariableById() {

        Long applicationId = createTestApplication();

        environmentVariableDao.createVariable(
                createVariable(
                        applicationId,
                        "TEMP_KEY",
                        "temporary"));

        EnvironmentVariable saved = environmentVariableDao.findByKey(
                applicationId,
                "TEMP_KEY");

        int rows = environmentVariableDao.deleteById(
                saved.getId());

        assertEquals(1, rows);

        assertFalse(
                environmentVariableDao.existsByKey(
                        applicationId,
                        "TEMP_KEY"));
    }

    @Test
    void deleteVariableByKey() {

        Long applicationId = createTestApplication();

        environmentVariableDao.createVariable(
                createVariable(
                        applicationId,
                        "DELETE_ME",
                        "value"));

        int rows = environmentVariableDao.deleteByKey(
                applicationId,
                "DELETE_ME");

        assertEquals(1, rows);

        assertFalse(
                environmentVariableDao.existsByKey(
                        applicationId,
                        "DELETE_ME"));
    }
}