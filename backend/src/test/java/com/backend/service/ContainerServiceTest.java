package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.dao.ContainerDao;
import com.backend.exception.InvalidStateTransitionException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Application;
import com.backend.model.Container;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Timestamp;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContainerServiceTest {

    @Mock
    private ContainerDao containerDao;

    @Mock
    private ApplicationDao applicationDao;

    @InjectMocks
    private ContainerService containerService;

    @Test
    void createContainer_shouldCreateContainer() {

        Container container = new Container();
        container.setApplicationId(1L);
        container.setDockerContainerId("docker-123");
        container.setImageName("my-app:latest");

        Application application = new Application();
        application.setId(1L);

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(containerDao.findByDockerContainerId("docker-123"))
                .thenReturn(null);

        when(containerDao.createContainer(container))
                .thenReturn(1);

        int result = containerService.createContainer(container);

        assertEquals(1, result);
        assertEquals("CREATED", container.getStatus());

        verify(applicationDao).findById(1L);
        verify(containerDao)
                .findByDockerContainerId("docker-123");
        verify(containerDao).createContainer(container);
    }

    @Test
    void createContainer_shouldRejectNullContainer() {

        assertThrows(
                IllegalArgumentException.class,
                () -> containerService.createContainer(null));

        verifyNoInteractions(containerDao, applicationDao);
    }

    @Test
    void createContainer_shouldRejectMissingApplicationId() {

        Container container = new Container();
        container.setDockerContainerId("docker-123");
        container.setImageName("my-app:latest");

        assertThrows(
                IllegalArgumentException.class,
                () -> containerService.createContainer(container));

        verifyNoInteractions(containerDao, applicationDao);
    }

    @Test
    void createContainer_shouldRejectMissingDockerContainerId() {

        Container container = new Container();
        container.setApplicationId(1L);
        container.setImageName("my-app:latest");

        assertThrows(
                IllegalArgumentException.class,
                () -> containerService.createContainer(container));

        verifyNoInteractions(containerDao, applicationDao);
    }

    @Test
    void createContainer_shouldRejectMissingImageName() {

        Container container = new Container();
        container.setApplicationId(1L);
        container.setDockerContainerId("docker-123");

        assertThrows(
                IllegalArgumentException.class,
                () -> containerService.createContainer(container));

        verifyNoInteractions(containerDao, applicationDao);
    }

    @Test
    void createContainer_shouldThrowWhenApplicationDoesNotExist() {

        Container container = new Container();
        container.setApplicationId(1L);
        container.setDockerContainerId("docker-123");
        container.setImageName("my-app:latest");

        when(applicationDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> containerService.createContainer(container));

        verify(applicationDao).findById(1L);
        verify(containerDao, never()).createContainer(any());
    }

    @Test
    void createContainer_shouldRejectDuplicateDockerContainerId() {

        Container container = new Container();
        container.setApplicationId(1L);
        container.setDockerContainerId("docker-123");
        container.setImageName("my-app:latest");

        Application application = new Application();
        application.setId(1L);

        Container existingContainer = new Container();
        existingContainer.setId(10L);
        existingContainer.setDockerContainerId("docker-123");

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(containerDao.findByDockerContainerId("docker-123"))
                .thenReturn(existingContainer);

        assertThrows(
                IllegalArgumentException.class,
                () -> containerService.createContainer(container));

        verify(containerDao, never()).createContainer(any());
    }

    @Test
    void findById_shouldReturnContainer() {

        Container container = new Container();
        container.setId(1L);

        when(containerDao.findById(1L))
                .thenReturn(container);

        Container result = containerService.findById(1L);

        assertEquals(container, result);

        verify(containerDao).findById(1L);
    }

    @Test
    void findById_shouldThrowWhenContainerDoesNotExist() {

        when(containerDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> containerService.findById(1L));

        verify(containerDao).findById(1L);
    }

    @Test
    void findById_shouldRejectNullId() {

        assertThrows(
                IllegalArgumentException.class,
                () -> containerService.findById(null));

        verifyNoInteractions(containerDao);
    }

    @Test
    void findByDockerContainerId_shouldReturnContainer() {

        Container container = new Container();
        container.setId(1L);
        container.setDockerContainerId("docker-123");

        when(containerDao.findByDockerContainerId("docker-123"))
                .thenReturn(container);

        Container result = containerService.findByDockerContainerId(
                "docker-123");

        assertEquals(container, result);

        verify(containerDao)
                .findByDockerContainerId("docker-123");
    }

    @Test
    void findByDockerContainerId_shouldThrowWhenNotFound() {

        when(containerDao.findByDockerContainerId("docker-123"))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> containerService.findByDockerContainerId(
                        "docker-123"));
    }

    @Test
    void findByApplicationId_shouldReturnContainers() {

        Application application = new Application();
        application.setId(1L);

        List<Container> containers = List.of(
                new Container(),
                new Container());

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(containerDao.findByApplicationId(1L))
                .thenReturn(containers);

        List<Container> result = containerService.findByApplicationId(1L);

        assertEquals(2, result.size());
        assertEquals(containers, result);

        verify(applicationDao).findById(1L);
        verify(containerDao).findByApplicationId(1L);
    }

    @Test
    void findByApplicationId_shouldThrowWhenApplicationDoesNotExist() {

        when(applicationDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> containerService.findByApplicationId(1L));

        verify(containerDao, never())
                .findByApplicationId(anyLong());
    }

    @Test
    void findRunningByApplicationId_shouldReturnRunningContainer() {

        Application application = new Application();
        application.setId(1L);

        Container container = new Container();
        container.setId(10L);
        container.setStatus("RUNNING");

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(containerDao.findRunningByApplicationId(1L))
                .thenReturn(container);

        Container result = containerService.findRunningByApplicationId(1L);

        assertEquals(container, result);

        verify(containerDao)
                .findRunningByApplicationId(1L);
    }

    @Test
    void findRunningByApplicationId_shouldThrowWhenNoRunningContainer() {

        Application application = new Application();
        application.setId(1L);

        when(applicationDao.findById(1L))
                .thenReturn(application);

        when(containerDao.findRunningByApplicationId(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> containerService.findRunningByApplicationId(1L));
    }

    @Test
    void updateStatus_shouldUpdateFromCreatedToRunning() {

        Container container = new Container();
        container.setId(1L);
        container.setStatus("CREATED");

        when(containerDao.findById(1L))
                .thenReturn(container);

        when(containerDao.updateStatus(1L, "RUNNING"))
                .thenReturn(1);

        int result = containerService.updateStatus(1L, "RUNNING");

        assertEquals(1, result);

        verify(containerDao)
                .updateStatus(1L, "RUNNING");
    }

    @Test
    void updateStatus_shouldRejectInvalidTransition() {

        Container container = new Container();
        container.setId(1L);
        container.setStatus("STOPPED");

        when(containerDao.findById(1L))
                .thenReturn(container);

        assertThrows(
                InvalidStateTransitionException.class,
                () -> containerService.updateStatus(
                        1L,
                        "RUNNING"));

        verify(containerDao, never())
                .updateStatus(anyLong(), anyString());
    }

    @Test
    void markStarted_shouldStartCreatedContainer() {

        Container container = new Container();
        container.setId(1L);
        container.setStatus("CREATED");

        when(containerDao.findById(1L))
                .thenReturn(container);

        when(containerDao.markStarted(
                eq(1L),
                any(Timestamp.class)))
                .thenReturn(1);

        int result = containerService.markStarted(1L);

        assertEquals(1, result);

        verify(containerDao)
                .markStarted(
                        eq(1L),
                        any(Timestamp.class));
    }

    @Test
    void markStopped_shouldStopRunningContainer() {

        Container container = new Container();
        container.setId(1L);
        container.setStatus("RUNNING");

        when(containerDao.findById(1L))
                .thenReturn(container);

        when(containerDao.markStopped(
                eq(1L),
                any(Timestamp.class)))
                .thenReturn(1);

        int result = containerService.markStopped(1L);

        assertEquals(1, result);

        verify(containerDao)
                .markStopped(
                        eq(1L),
                        any(Timestamp.class));
    }

    @Test
    void markCrashed_shouldMarkRunningContainer() {

        Container container = new Container();
        container.setId(1L);
        container.setStatus("RUNNING");

        when(containerDao.findById(1L))
                .thenReturn(container);

        when(containerDao.markCrashed(1L))
                .thenReturn(1);

        int result = containerService.markCrashed(1L);

        assertEquals(1, result);

        verify(containerDao)
                .markCrashed(1L);
    }

    @Test
    void markStopped_shouldRejectCreatedContainer() {

        Container container = new Container();
        container.setId(1L);
        container.setStatus("CREATED");

        when(containerDao.findById(1L))
                .thenReturn(container);

        assertThrows(
                InvalidStateTransitionException.class,
                () -> containerService.markStopped(1L));

        verify(containerDao, never())
                .markStopped(anyLong(), any(Timestamp.class));
    }

    @Test
    void markCrashed_shouldRejectStoppedContainer() {

        Container container = new Container();
        container.setId(1L);
        container.setStatus("STOPPED");

        when(containerDao.findById(1L))
                .thenReturn(container);

        assertThrows(
                InvalidStateTransitionException.class,
                () -> containerService.markCrashed(1L));

        verify(containerDao, never())
                .markCrashed(anyLong());
    }

    @Test
    void deleteContainer_shouldDeleteContainer() {

        Container container = new Container();
        container.setId(1L);

        when(containerDao.findById(1L))
                .thenReturn(container);

        when(containerDao.deleteContainer(1L))
                .thenReturn(1);

        int result = containerService.deleteContainer(1L);

        assertEquals(1, result);

        verify(containerDao).findById(1L);
        verify(containerDao).deleteContainer(1L);
    }

    @Test
    void deleteContainer_shouldThrowWhenContainerDoesNotExist() {

        when(containerDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> containerService.deleteContainer(1L));

        verify(containerDao, never())
                .deleteContainer(anyLong());
    }

    @Test
    void deleteContainer_shouldRejectNullId() {

        assertThrows(
                IllegalArgumentException.class,
                () -> containerService.deleteContainer(null));

        verifyNoInteractions(containerDao);
    }
}