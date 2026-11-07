package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.git.GitService;
import com.backend.model.Application;
import com.backend.model.Container;
import com.backend.runtime.Runtime;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ApplicationLifecycleTest {

    @Test
    void restartRestartsContainerForRunningApplication() {
        ApplicationDao applicationDao = mock(ApplicationDao.class);
        WorkloadJobService jobService = mock(WorkloadJobService.class);
        ContainerService containerService = mock(ContainerService.class);
        EnvironmentVariableService variableService = mock(EnvironmentVariableService.class);
        Runtime runtime = mock(Runtime.class);
        GitService gitService = mock(GitService.class);
        Application application = new Application();
        application.setId(12L);
        application.setStatus("RUNNING");
        Container container = new Container();
        container.setId(34L);

        when(applicationDao.findById(12L)).thenReturn(application);
        when(containerService.findByApplicationId(12L)).thenReturn(List.of(container));

        ApplicationService service = new ApplicationService(
                applicationDao, jobService, containerService, variableService, runtime, gitService);

        assertEquals("Application restarted", service.restartApplication(12L));
        verify(containerService).restartContainer(34L);
        verify(applicationDao).updateStatus(12L, "RUNNING");
    }

    @Test
    void startRestartsPreviouslyStoppedContainer() {
        ApplicationDao applicationDao = mock(ApplicationDao.class);
        WorkloadJobService jobService = mock(WorkloadJobService.class);
        ContainerService containerService = mock(ContainerService.class);
        EnvironmentVariableService variableService = mock(EnvironmentVariableService.class);
        Runtime runtime = mock(Runtime.class);
        GitService gitService = mock(GitService.class);
        Application application = new Application();
        application.setId(12L);
        application.setStatus("STOPPED");
        Container container = new Container();
        container.setId(34L);

        when(applicationDao.findById(12L)).thenReturn(application);
        when(containerService.findByApplicationId(12L)).thenReturn(List.of(container));

        ApplicationService service = new ApplicationService(
                applicationDao, jobService, containerService, variableService, runtime, gitService);

        assertEquals("Application is Running", service.startApplication(12L));
        verify(containerService).startContainer(34L);
        verify(applicationDao).updateStatus(12L, "RUNNING");
    }

    @Test
    void startDoesNotQueueDeploymentWhenDockerIsUnavailable() {
        ApplicationDao applicationDao = mock(ApplicationDao.class);
        WorkloadJobService jobService = mock(WorkloadJobService.class);
        ContainerService containerService = mock(ContainerService.class);
        EnvironmentVariableService variableService = mock(EnvironmentVariableService.class);
        Runtime runtime = mock(Runtime.class);
        GitService gitService = mock(GitService.class);
        Application application = new Application();
        application.setId(12L);
        application.setStatus("CREATED");

        when(applicationDao.findById(12L)).thenReturn(application);
        when(containerService.findByApplicationId(12L)).thenReturn(List.of());
        doThrow(new IllegalStateException("Docker is unavailable"))
                .when(runtime).verifyAvailable();

        ApplicationService service = new ApplicationService(
                applicationDao, jobService, containerService, variableService, runtime, gitService);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.startApplication(12L));

        assertEquals("Docker is unavailable", exception.getMessage());
        verify(jobService, never()).createJob(org.mockito.ArgumentMatchers.any());
        verify(applicationDao, never()).updateStatus(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }
}
