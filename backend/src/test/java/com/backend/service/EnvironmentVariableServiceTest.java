package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.dao.EnvironmentVariableDao;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Application;
import com.backend.model.EnvironmentVariable;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnvironmentVariableServiceTest {

    @Mock
    private EnvironmentVariableDao environmentVariableDao;

    @Mock
    private ApplicationDao applicationDao;

    @InjectMocks
    private EnvironmentVariableService environmentVariableService;

    @Test
    void createVariable_shouldCreateVariable() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setApplicationId(1L);
        variable.setVariableKey("PORT");
        variable.setVariableValue("8080");

        Application application = new Application();
        application.setId(1L);

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(environmentVariableDao.existsByKey(
                1L,
                "PORT"))
                .thenReturn(false);

        when(environmentVariableDao.createVariable(variable))
                .thenReturn(1);

        int result = environmentVariableService.createVariable(
                variable);

        assertEquals(1, result);

        verify(applicationDao).findById(1L);

        verify(environmentVariableDao)
                .existsByKey(1L, "PORT");

        verify(environmentVariableDao)
                .createVariable(variable);
    }

    @Test
    void createVariable_shouldRejectNullVariable() {

        assertThrows(
                IllegalArgumentException.class,
                () -> environmentVariableService
                        .createVariable(null));

        verifyNoInteractions(
                environmentVariableDao,
                applicationDao);
    }

    @Test
    void createVariable_shouldRejectMissingApplicationId() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setVariableKey("PORT");
        variable.setVariableValue("8080");

        assertThrows(
                IllegalArgumentException.class,
                () -> environmentVariableService
                        .createVariable(variable));

        verifyNoInteractions(
                environmentVariableDao,
                applicationDao);
    }

    @Test
    void createVariable_shouldRejectMissingKey() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setApplicationId(1L);
        variable.setVariableValue("8080");

        assertThrows(
                IllegalArgumentException.class,
                () -> environmentVariableService
                        .createVariable(variable));

        verifyNoInteractions(
                environmentVariableDao,
                applicationDao);
    }

    @Test
    void createVariable_shouldRejectMissingValue() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setApplicationId(1L);
        variable.setVariableKey("PORT");

        assertThrows(
                IllegalArgumentException.class,
                () -> environmentVariableService
                        .createVariable(variable));

        verifyNoInteractions(
                environmentVariableDao,
                applicationDao);
    }

    @Test
    void createVariable_shouldThrowWhenApplicationDoesNotExist() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setApplicationId(1L);
        variable.setVariableKey("PORT");
        variable.setVariableValue("8080");

        when(applicationDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> environmentVariableService
                        .createVariable(variable));

        verify(applicationDao).findById(1L);

        verify(environmentVariableDao, never())
                .createVariable(any());
    }

    @Test
    void createVariable_shouldRejectDuplicateKey() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setApplicationId(1L);
        variable.setVariableKey("PORT");
        variable.setVariableValue("8080");

        Application application = new Application();
        application.setId(1L);

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(environmentVariableDao.existsByKey(
                1L,
                "PORT"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> environmentVariableService
                        .createVariable(variable));

        verify(environmentVariableDao, never())
                .createVariable(any());
    }

    @Test
    void findById_shouldReturnVariable() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setId(1L);

        when(environmentVariableDao.findById(1L))
                .thenReturn(variable);

        EnvironmentVariable result = environmentVariableService.findById(1L);

        assertEquals(variable, result);

        verify(environmentVariableDao)
                .findById(1L);
    }

    @Test
    void findById_shouldThrowWhenNotFound() {

        when(environmentVariableDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> environmentVariableService
                        .findById(1L));

        verify(environmentVariableDao)
                .findById(1L);
    }

    @Test
    void findById_shouldRejectNullId() {

        assertThrows(
                IllegalArgumentException.class,
                () -> environmentVariableService
                        .findById(null));

        verifyNoInteractions(environmentVariableDao);
    }

    @Test
    void findByKey_shouldReturnVariable() {

        Application application = new Application();
        application.setId(1L);

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setId(10L);
        variable.setApplicationId(1L);
        variable.setVariableKey("PORT");

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(environmentVariableDao.findByKey(
                1L,
                "PORT"))
                .thenReturn(variable);

        EnvironmentVariable result = environmentVariableService.findByKey(
                1L,
                "PORT");

        assertEquals(variable, result);

        verify(applicationDao).findById(1L);

        verify(environmentVariableDao)
                .findByKey(1L, "PORT");
    }

    @Test
    void findByKey_shouldThrowWhenApplicationDoesNotExist() {

        when(applicationDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> environmentVariableService
                        .findByKey(1L, "PORT"));

        verify(environmentVariableDao, never())
                .findByKey(anyLong(), anyString());
    }

    @Test
    void findByKey_shouldThrowWhenVariableDoesNotExist() {

        Application application = new Application();
        application.setId(1L);

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(environmentVariableDao.findByKey(
                1L,
                "PORT"))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> environmentVariableService
                        .findByKey(1L, "PORT"));
    }

    @Test
    void findByApplicationId_shouldReturnVariables() {

        Application application = new Application();
        application.setId(1L);

        List<EnvironmentVariable> variables = List.of(
                new EnvironmentVariable(),
                new EnvironmentVariable());

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(environmentVariableDao
                .findByApplicationId(1L))
                .thenReturn(variables);

        List<EnvironmentVariable> result = environmentVariableService
                .findByApplicationId(1L);

        assertEquals(2, result.size());
        assertEquals(variables, result);

        verify(environmentVariableDao)
                .findByApplicationId(1L);
    }

    @Test
    void findByApplicationId_shouldThrowWhenApplicationDoesNotExist() {

        when(applicationDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> environmentVariableService
                        .findByApplicationId(1L));

        verify(environmentVariableDao, never())
                .findByApplicationId(anyLong());
    }

    @Test
    void updateVariable_shouldUpdateVariable() {

        EnvironmentVariable existing = new EnvironmentVariable();

        existing.setId(1L);
        existing.setApplicationId(1L);
        existing.setVariableKey("PORT");
        existing.setVariableValue("8080");

        EnvironmentVariable updated = new EnvironmentVariable();

        updated.setId(1L);
        updated.setApplicationId(1L);
        updated.setVariableKey("PORT");
        updated.setVariableValue("9090");

        when(environmentVariableDao.findById(1L))
                .thenReturn(existing);

        when(environmentVariableDao.updateVariable(updated))
                .thenReturn(1);

        int result = environmentVariableService
                .updateVariable(updated);

        assertEquals(1, result);

        verify(environmentVariableDao)
                .findById(1L);

        verify(environmentVariableDao)
                .updateVariable(updated);

        verify(environmentVariableDao, never())
                .existsByKey(anyLong(), anyString());
    }

    @Test
    void updateVariable_shouldThrowWhenVariableDoesNotExist() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setId(1L);
        variable.setApplicationId(1L);
        variable.setVariableKey("PORT");
        variable.setVariableValue("8080");

        when(environmentVariableDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> environmentVariableService
                        .updateVariable(variable));

        verify(environmentVariableDao, never())
                .updateVariable(any());
    }

    @Test
    void updateVariable_shouldRejectDifferentApplication() {

        EnvironmentVariable existing = new EnvironmentVariable();

        existing.setId(1L);
        existing.setApplicationId(1L);
        existing.setVariableKey("PORT");
        existing.setVariableValue("8080");

        EnvironmentVariable updated = new EnvironmentVariable();

        updated.setId(1L);
        updated.setApplicationId(2L);
        updated.setVariableKey("PORT");
        updated.setVariableValue("9090");

        when(environmentVariableDao.findById(1L))
                .thenReturn(existing);

        assertThrows(
                IllegalArgumentException.class,
                () -> environmentVariableService
                        .updateVariable(updated));

        verify(environmentVariableDao, never())
                .updateVariable(any());
    }

    @Test
    void updateVariable_shouldRejectDuplicateNewKey() {

        EnvironmentVariable existing = new EnvironmentVariable();

        existing.setId(1L);
        existing.setApplicationId(1L);
        existing.setVariableKey("PORT");
        existing.setVariableValue("8080");

        EnvironmentVariable updated = new EnvironmentVariable();

        updated.setId(1L);
        updated.setApplicationId(1L);
        updated.setVariableKey("DB_HOST");
        updated.setVariableValue("localhost");

        when(environmentVariableDao.findById(1L))
                .thenReturn(existing);

        when(environmentVariableDao.existsByKey(
                1L,
                "DB_HOST"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> environmentVariableService
                        .updateVariable(updated));

        verify(environmentVariableDao, never())
                .updateVariable(any());
    }

    @Test
    void deleteById_shouldDeleteVariable() {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setId(1L);

        when(environmentVariableDao.findById(1L))
                .thenReturn(variable);

        when(environmentVariableDao.deleteById(1L))
                .thenReturn(1);

        int result = environmentVariableService.deleteById(1L);

        assertEquals(1, result);

        verify(environmentVariableDao)
                .findById(1L);

        verify(environmentVariableDao)
                .deleteById(1L);
    }

    @Test
    void deleteByKey_shouldDeleteVariable() {

        Application application = new Application();
        application.setId(1L);

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setId(10L);
        variable.setApplicationId(1L);
        variable.setVariableKey("PORT");

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(environmentVariableDao.findByKey(
                1L,
                "PORT"))
                .thenReturn(variable);

        when(environmentVariableDao.deleteByKey(
                1L,
                "PORT"))
                .thenReturn(1);

        int result = environmentVariableService.deleteByKey(
                1L,
                "PORT");

        assertEquals(1, result);

        verify(environmentVariableDao)
                .deleteByKey(1L, "PORT");
    }

    @Test
    void deleteByKey_shouldThrowWhenVariableDoesNotExist() {

        Application application = new Application();
        application.setId(1L);

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(environmentVariableDao.findByKey(
                1L,
                "PORT"))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> environmentVariableService
                        .deleteByKey(1L, "PORT"));

        verify(environmentVariableDao, never())
                .deleteByKey(anyLong(), anyString());
    }

    @Test
    void deleteById_shouldRejectNullId() {

        assertThrows(
                IllegalArgumentException.class,
                () -> environmentVariableService
                        .deleteById(null));

        verifyNoInteractions(environmentVariableDao);
    }
}