package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.InvalidStateTransitionException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Application;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

        @Mock
        private ApplicationDao applicationDao;

        @InjectMocks
        private ApplicationService applicationService;

        private Application application;

        @BeforeEach
        void setUp() {

                application = new Application();

                application.setId(1L);
                application.setUserId(10L);
                application.setName("test-app");
                application.setRepositoryUrl("https://github.com/test/test-app");
                application.setBranch("main");
                application.setBuildCommand("npm install");
                application.setStartCommand("npm start");
                application.setStatus("CREATED");
        }

        @Test
        void createApplication_shouldCreateApplication() {

                when(applicationDao.existsByNameForUser(10L, "test-app"))
                                .thenReturn(false);

                when(applicationDao.createApplication(application))
                                .thenReturn(1L);

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                Application result = applicationService.createApplication(application);

                assertNotNull(result);
                assertEquals(1L, result.getId());
                assertEquals("test-app", result.getName());

                verify(applicationDao)
                                .existsByNameForUser(10L, "test-app");

                verify(applicationDao)
                                .createApplication(application);

                verify(applicationDao)
                                .findById(1L);
        }

        @Test
        void createApplication_shouldThrowExceptionWhenApplicationIsNull() {

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> applicationService.createApplication(null));

                assertEquals(
                                "Application cannot be null",
                                exception.getMessage());

                verifyNoInteractions(applicationDao);
        }

        @Test
        void createApplication_shouldThrowExceptionWhenNameIsBlank() {

                application.setName(" ");

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> applicationService.createApplication(application));

                assertEquals(
                                "Application name is required",
                                exception.getMessage());

                verifyNoInteractions(applicationDao);
        }

        @Test
        void createApplication_shouldThrowDuplicateResourceExceptionWhenNameExists() {

                when(applicationDao.existsByNameForUser(10L, "test-app"))
                                .thenReturn(true);

                DuplicateResourceException exception = assertThrows(
                                DuplicateResourceException.class,
                                () -> applicationService.createApplication(application));

                assertEquals(
                                "Application with this name already exists for the user",
                                exception.getMessage());

                verify(applicationDao)
                                .existsByNameForUser(10L, "test-app");

                verify(applicationDao, never())
                                .createApplication(any());
        }

        @Test
        void findById_shouldReturnApplication() {

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                Application result = applicationService.findById(1L);

                assertNotNull(result);
                assertEquals(1L, result.getId());
                assertEquals("test-app", result.getName());

                verify(applicationDao).findById(1L);
        }

        @Test
        void findById_shouldThrowExceptionWhenNotFound() {

                when(applicationDao.findById(999L))
                                .thenReturn(null);

                ResourceNotFoundException exception = assertThrows(
                                ResourceNotFoundException.class,
                                () -> applicationService.findById(999L));

                assertEquals(
                                "Application not found with id: 999",
                                exception.getMessage());

                verify(applicationDao).findById(999L);
        }

        @Test
        void findById_shouldThrowExceptionWhenIdIsNull() {

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> applicationService.findById(null));

                assertEquals(
                                "Application ID is required",
                                exception.getMessage());

                verifyNoInteractions(applicationDao);
        }

        @Test
        void findByUserId_shouldReturnApplications() {

                when(applicationDao.findByUserId(10L))
                                .thenReturn(java.util.List.of(application));

                var result = applicationService.findByUserId(10L);

                assertNotNull(result);
                assertEquals(1, result.size());
                assertEquals("test-app", result.get(0).getName());

                verify(applicationDao).findByUserId(10L);
        }

        @Test
        void findByUserId_shouldThrowExceptionWhenUserIdIsNull() {

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> applicationService.findByUserId(null));

                assertEquals(
                                "User ID is required",
                                exception.getMessage());

                verifyNoInteractions(applicationDao);
        }

        @Test
        void updateApplication_shouldUpdateApplication() {

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                when(applicationDao.updateApplication(application))
                                .thenReturn(1);

                int result = applicationService.updateApplication(application);

                assertEquals(1, result);

                verify(applicationDao).findById(1L);
                verify(applicationDao).updateApplication(application);
        }

        @Test
        void updateApplication_shouldThrowExceptionWhenApplicationNotFound() {

                when(applicationDao.findById(1L))
                                .thenReturn(null);

                assertThrows(
                                ResourceNotFoundException.class,
                                () -> applicationService.updateApplication(application));

                verify(applicationDao).findById(1L);

                verify(applicationDao, never())
                                .updateApplication(any());
        }

        @Test
        void updateStatus_shouldUpdateStatus() {

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                when(applicationDao.updateStatus(1L, "READY"))
                                .thenReturn(1);

                int result = applicationService.updateStatus(1L, "READY");

                assertEquals(1, result);

                verify(applicationDao).findById(1L);
                verify(applicationDao).updateStatus(1L, "READY");
        }

        @Test
        void updateStatus_shouldThrowExceptionWhenApplicationNotFound() {

                when(applicationDao.findById(1L))
                                .thenReturn(null);

                assertThrows(
                                ResourceNotFoundException.class,
                                () -> applicationService.updateStatus(1L, "READY"));

                verify(applicationDao, never())
                                .updateStatus(anyLong(), anyString());
        }

        @Test
        void deleteApplication_shouldDeleteApplication() {

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                when(applicationDao.deleteApplication(1L))
                                .thenReturn(1);

                int result = applicationService.deleteApplication(1L);

                assertEquals(1, result);

                verify(applicationDao).findById(1L);
                verify(applicationDao).deleteApplication(1L);
        }

        @Test
        void deleteApplication_shouldThrowExceptionWhenApplicationNotFound() {

                when(applicationDao.findById(999L))
                                .thenReturn(null);

                assertThrows(
                                ResourceNotFoundException.class,
                                () -> applicationService.deleteApplication(999L));

                verify(applicationDao, never())
                                .deleteApplication(anyLong());
        }

        @Test
        void updateStatus_shouldAllowValidTransition() {

                application.setStatus("CREATED");

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                when(applicationDao.updateStatus(1L, "READY"))
                                .thenReturn(1);

                int result = applicationService.updateStatus(1L, "READY");

                assertEquals(1, result);

                verify(applicationDao).updateStatus(1L, "READY");
        }

        @Test
        void updateStatus_shouldRejectInvalidTransition() {

                application.setStatus("CREATED");

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                InvalidStateTransitionException exception = assertThrows(
                                InvalidStateTransitionException.class,
                                () -> applicationService.updateStatus(1L, "RUNNING"));

                assertEquals(
                                "Invalid application state transition: CREATED -> RUNNING",
                                exception.getMessage());

                verify(applicationDao, never())
                                .updateStatus(anyLong(), anyString());
        }
}
