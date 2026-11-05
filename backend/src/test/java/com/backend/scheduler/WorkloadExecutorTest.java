package com.backend.scheduler;

import com.backend.git.GitService;
import com.backend.model.Application;
import com.backend.model.WorkloadJob;
import com.backend.runtime.Runtime;
import com.backend.service.ApplicationService;
import com.backend.service.ContainerService;
import com.backend.service.EnvironmentVariableService;
import com.backend.service.WorkloadJobService;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

class WorkloadExecutorTest {

    @Test
    void failedDeploymentMarksApplicationFailedAndJobFailed() {
        WorkloadJobService jobService = mock(WorkloadJobService.class);
        ApplicationService applicationService = mock(ApplicationService.class);
        ContainerService containerService = mock(ContainerService.class);
        EnvironmentVariableService environmentVariableService = mock(EnvironmentVariableService.class);
        GitService gitService = mock(GitService.class);
        Runtime runtime = mock(Runtime.class);
        Application application = new Application();
        application.setId(8L);
        application.setRepositoryUrl("https://example.com/acme/app.git");
        application.setBranch("main");
        WorkloadJob job = new WorkloadJob();
        job.setId(3L);
        job.setApplicationId(8L);
        job.setJobType("DEPLOY");

        when(applicationService.findById(8L)).thenReturn(application);
        when(gitService.cloneRepository(8L, application.getRepositoryUrl(), "main"))
                .thenThrow(new RuntimeException("Git is unavailable"));

        WorkloadExecutor executor = new WorkloadExecutor(
                jobService, applicationService, containerService,
                environmentVariableService, gitService, runtime);
        executor.execute(job);

        verify(applicationService).updateStatus(8L, "FAILED");
        verify(jobService).failJob(3L);
    }

    @Test
    void deploymentFailsWhenContainerExitsImmediately() {
        WorkloadJobService jobService = mock(WorkloadJobService.class);
        ApplicationService applicationService = mock(ApplicationService.class);
        ContainerService containerService = mock(ContainerService.class);
        EnvironmentVariableService environmentVariableService = mock(EnvironmentVariableService.class);
        GitService gitService = mock(GitService.class);
        Runtime runtime = mock(Runtime.class);
        Application application = new Application();
        application.setId(8L);
        application.setRepositoryUrl("https://example.com/acme/app.git");
        application.setBranch("main");
        application.setPlan("BASIC");
        application.setContainerPort(8080);
        WorkloadJob job = new WorkloadJob();
        job.setId(3L);
        job.setApplicationId(8L);
        job.setJobType("DEPLOY");

        when(applicationService.findById(8L)).thenReturn(application);
        when(gitService.cloneRepository(8L, application.getRepositoryUrl(), "main"))
                .thenReturn("C:\\workspace\\app-8");
        when(runtime.getExposedPorts("hostex-app-8")).thenReturn(java.util.List.of(80));
        when(runtime.createContainer(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyInt(),
                org.mockito.ArgumentMatchers.eq(80),
                org.mockito.ArgumentMatchers.anyDouble(),
                org.mockito.ArgumentMatchers.anyInt(),
                org.mockito.ArgumentMatchers.isNull(),
                org.mockito.ArgumentMatchers.anyList()))
                .thenReturn("container-8");
        when(runtime.getContainerStatus("container-8")).thenReturn("exited");

        WorkloadExecutor executor = new WorkloadExecutor(
                jobService, applicationService, containerService,
                environmentVariableService, gitService, runtime);
        executor.execute(job);

        verify(applicationService).updateStatus(8L, "FAILED");
        verify(jobService).failJob(3L);
        verify(containerService, never()).createContainer(org.mockito.ArgumentMatchers.any());
    }
}
