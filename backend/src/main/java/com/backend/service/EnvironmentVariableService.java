package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.dao.EnvironmentVariableDao;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Application;
import com.backend.model.EnvironmentVariable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnvironmentVariableService {

    private final EnvironmentVariableDao environmentVariableDao;
    private final ApplicationDao applicationDao;

    public EnvironmentVariableService(
            EnvironmentVariableDao environmentVariableDao,
            ApplicationDao applicationDao) {

        this.environmentVariableDao = environmentVariableDao;
        this.applicationDao = applicationDao;
    }

    public int createVariable(
            EnvironmentVariable variable) {

        if (variable == null) {
            throw new IllegalArgumentException(
                    "Environment variable cannot be null");
        }

        if (variable.getApplicationId() == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        if (variable.getVariableKey() == null ||
                variable.getVariableKey().isBlank()) {

            throw new IllegalArgumentException(
                    "Environment variable key is required");
        }

        if (variable.getVariableValue() == null) {
            throw new IllegalArgumentException(
                    "Environment variable value is required");
        }

        Application application = applicationDao.findById(
                variable.getApplicationId());

        if (application == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: "
                            + variable.getApplicationId());
        }

        if (environmentVariableDao.existsByKey(
                variable.getApplicationId(),
                variable.getVariableKey())) {

            throw new DuplicateResourceException(
                    "Environment variable already exists with key: "
                            + variable.getVariableKey());
        }

        return environmentVariableDao.createVariable(variable);
    }

    public EnvironmentVariable findById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Environment variable ID is required");
        }

        EnvironmentVariable variable = environmentVariableDao.findById(id);

        if (variable == null) {
            throw new ResourceNotFoundException(
                    "Environment variable not found with id: "
                            + id);
        }

        return variable;
    }

    public EnvironmentVariable findByKey(
            Long applicationId,
            String variableKey) {

        validateApplicationId(applicationId);
        validateKey(variableKey);

        if (applicationDao.findById(applicationId) == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: "
                            + applicationId);
        }

        EnvironmentVariable variable = environmentVariableDao.findByKey(
                applicationId,
                variableKey);

        if (variable == null) {
            throw new ResourceNotFoundException(
                    "Environment variable not found with key: "
                            + variableKey);
        }

        return variable;
    }

    public List<EnvironmentVariable> findByApplicationId(
            Long applicationId) {

        validateApplicationId(applicationId);

        if (applicationDao.findById(applicationId) == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: "
                            + applicationId);
        }

        return environmentVariableDao.findByApplicationId(
                applicationId);
    }

    public int updateVariable(
            EnvironmentVariable variable) {

        if (variable == null) {
            throw new IllegalArgumentException(
                    "Environment variable cannot be null");
        }

        if (variable.getId() == null) {
            throw new IllegalArgumentException(
                    "Environment variable ID is required");
        }

        if (variable.getApplicationId() == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        validateKey(variable.getVariableKey());

        if (variable.getVariableValue() == null) {
            throw new IllegalArgumentException(
                    "Environment variable value is required");
        }

        EnvironmentVariable existingVariable = environmentVariableDao.findById(
                variable.getId());

        if (existingVariable == null) {
            throw new ResourceNotFoundException(
                    "Environment variable not found with id: "
                            + variable.getId());
        }

        if (!existingVariable.getApplicationId()
                .equals(variable.getApplicationId())) {

            throw new IllegalArgumentException(
                    "Environment variable does not belong "
                            + "to the specified application");
        }

        if (!existingVariable.getVariableKey()
                .equals(variable.getVariableKey())
                && environmentVariableDao.existsByKey(
                        variable.getApplicationId(),
                        variable.getVariableKey())) {

            throw new DuplicateResourceException(
                    "Environment variable already exists with key: "
                            + variable.getVariableKey());
        }

        return environmentVariableDao.updateVariable(variable);
    }

    public int deleteById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Environment variable ID is required");
        }

        findById(id);

        return environmentVariableDao.deleteById(id);
    }

    public int deleteByKey(
            Long applicationId,
            String variableKey) {

        validateApplicationId(applicationId);
        validateKey(variableKey);

        if (applicationDao.findById(applicationId) == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: "
                            + applicationId);
        }

        EnvironmentVariable variable = environmentVariableDao.findByKey(
                applicationId,
                variableKey);

        if (variable == null) {
            throw new ResourceNotFoundException(
                    "Environment variable not found with key: "
                            + variableKey);
        }

        return environmentVariableDao.deleteByKey(
                applicationId,
                variableKey);
    }

    private void validateApplicationId(Long applicationId) {

        if (applicationId == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }
    }

    private void validateKey(String variableKey) {

        if (variableKey == null ||
                variableKey.isBlank()) {

            throw new IllegalArgumentException(
                    "Environment variable key is required");
        }
    }
}