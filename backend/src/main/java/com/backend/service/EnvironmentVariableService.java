package com.backend.service;

import com.backend.dao.EnvironmentVariableDao;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.EnvironmentVariable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnvironmentVariableService {

    private final EnvironmentVariableDao variableDao;

    public EnvironmentVariableService(
            EnvironmentVariableDao variableDao) {

        this.variableDao = variableDao;
    }

    public EnvironmentVariable createVariable(
            EnvironmentVariable variable) {

        if (variable == null ||
                variable.getApplicationId() == null ||
                variable.getVariableKey() == null) {

            throw new IllegalArgumentException(
                    "Invalid environment variable");
        }

        if (variableDao.existsByKey(
                variable.getApplicationId(),
                variable.getVariableKey())) {

            throw new DuplicateResourceException(
                    "Environment variable already exists");
        }

        Long id = variableDao.createVariable(variable);

        return findById(id);
    }

    public EnvironmentVariable findById(Long id) {

        EnvironmentVariable variable = variableDao.findById(id);

        if (variable == null) {
            throw new ResourceNotFoundException(
                    "Environment variable not found");
        }

        return variable;
    }

    public List<EnvironmentVariable> findByApplicationId(
            Long applicationId) {

        return variableDao.findByApplicationId(
                applicationId);
    }

    public EnvironmentVariable findByKey(
            Long applicationId,
            String key) {

        EnvironmentVariable variable = variableDao.findByKey(
                applicationId,
                key);

        if (variable == null) {
            throw new ResourceNotFoundException(
                    "Environment variable not found");
        }

        return variable;
    }

    public void updateVariable(
            EnvironmentVariable variable) {

        findById(variable.getId());

        variableDao.updateVariable(variable);
    }

    public void deleteById(Long id) {

        findById(id);

        variableDao.deleteById(id);
    }

    public void deleteByKey(
            Long applicationId,
            String key) {

        variableDao.deleteByKey(
                applicationId,
                key);
    }
}