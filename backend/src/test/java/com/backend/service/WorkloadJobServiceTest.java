package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.dao.WorkloadJobDao;
import com.backend.exception.InvalidStateTransitionException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.Application;
import com.backend.model.WorkloadJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Timestamp;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkloadJobServiceTest {

        @Mock
        private WorkloadJobDao workloadJobDao;

        @Mock
        private ApplicationDao applicationDao;

        @InjectMocks
        private WorkloadJobService workloadJobService;

        private WorkloadJob job;
        private Application application;

        @BeforeEach
        void setUp() {

                application = new Application();
                application.setId(1L);

                job = new WorkloadJob();
                job.setId(10L);
                job.setApplicationId(1L);
                job.setJobType("BUILD");
                job.setPriority(1);
                job.setBurstTime(10);
        }

        // ---------------------------------------------------------
        // createJob()
        // ---------------------------------------------------------

        @Test
        void createJob_shouldCreateQueuedJob() {

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                when(workloadJobDao.createJob(job))
                                .thenReturn(10L);

                Long result = workloadJobService.createJob(job);

                assertEquals(10L, result);
                assertEquals("QUEUED", job.getStatus());

                verify(applicationDao)
                                .findById(1L);

                verify(workloadJobDao)
                                .createJob(job);
        }

        @Test
        void createJob_shouldRejectNullJob() {

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.createJob(null));

                assertEquals(
                                "Workload job cannot be null",
                                exception.getMessage());

                verifyNoInteractions(
                                applicationDao,
                                workloadJobDao);
        }

        @Test
        void createJob_shouldRejectMissingApplicationId() {

                job.setApplicationId(null);

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.createJob(job));

                assertEquals(
                                "Application ID is required",
                                exception.getMessage());

                verifyNoInteractions(
                                applicationDao,
                                workloadJobDao);
        }

        @Test
        void createJob_shouldRejectMissingJobType() {

                job.setJobType(null);

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.createJob(job));

                assertEquals(
                                "Job type is required",
                                exception.getMessage());

                verifyNoInteractions(workloadJobDao);
        }

        @Test
        void createJob_shouldRejectInvalidJobType() {

                job.setJobType("INVALID");

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.createJob(job));

                assertEquals(
                                "Invalid job type: INVALID",
                                exception.getMessage());

                verifyNoInteractions(
                                applicationDao,
                                workloadJobDao);
        }

        @Test
        void createJob_shouldRejectWhenApplicationDoesNotExist() {

                when(applicationDao.findById(1L))
                                .thenReturn(null);

                ResourceNotFoundException exception = assertThrows(
                                ResourceNotFoundException.class,
                                () -> workloadJobService.createJob(job));

                assertEquals(
                                "Application not found with id: 1",
                                exception.getMessage());

                verify(applicationDao)
                                .findById(1L);

                verifyNoInteractions(workloadJobDao);
        }

        @Test
        void createJob_shouldAllowDeployJob() {

                job.setJobType("DEPLOY");

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                when(workloadJobDao.createJob(job))
                                .thenReturn(11L);

                Long result = workloadJobService.createJob(job);

                assertEquals(11L, result);
                assertEquals("QUEUED", job.getStatus());

                verify(workloadJobDao)
                                .createJob(job);
        }

        @Test
        void createJob_shouldAllowRestartJob() {

                job.setJobType("RESTART");

                when(applicationDao.findById(1L))
                                .thenReturn(application);

                when(workloadJobDao.createJob(job))
                                .thenReturn(12L);

                Long result = workloadJobService.createJob(job);

                assertEquals(12L, result);
                assertEquals("QUEUED", job.getStatus());

                verify(workloadJobDao)
                                .createJob(job);
        }

        // ---------------------------------------------------------
        // updateStatus()
        // ---------------------------------------------------------

        @Test
        void updateStatus_shouldAllowValidTransition() {

                job.setStatus("QUEUED");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                when(workloadJobDao.updateStatus(10L, "SCHEDULED"))
                                .thenReturn(1);

                int result = workloadJobService.updateStatus(
                                10L,
                                "SCHEDULED");

                assertEquals(1, result);

                verify(workloadJobDao)
                                .updateStatus(10L, "SCHEDULED");
        }

        @Test
        void updateStatus_shouldRejectInvalidTransition() {

                job.setStatus("QUEUED");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                InvalidStateTransitionException exception = assertThrows(
                                InvalidStateTransitionException.class,
                                () -> workloadJobService.updateStatus(
                                                10L,
                                                "RUNNING"));

                assertEquals(
                                "Invalid workload job state transition: "
                                                + "QUEUED -> RUNNING",
                                exception.getMessage());

                verify(workloadJobDao, never())
                                .updateStatus(anyLong(), anyString());
        }

        @Test
        void updateStatus_shouldRejectMissingJob() {

                when(workloadJobDao.findById(10L))
                                .thenReturn(null);

                ResourceNotFoundException exception = assertThrows(
                                ResourceNotFoundException.class,
                                () -> workloadJobService.updateStatus(
                                                10L,
                                                "SCHEDULED"));

                assertEquals(
                                "Workload job not found with id: 10",
                                exception.getMessage());

                verify(workloadJobDao, never())
                                .updateStatus(anyLong(), anyString());
        }

        // ---------------------------------------------------------
        // scheduleJob()
        // ---------------------------------------------------------

        @Test
        void scheduleJob_shouldMoveQueuedToScheduled() {

                job.setStatus("QUEUED");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                when(workloadJobDao.markScheduled(10L))
                                .thenReturn(1);

                int result = workloadJobService.scheduleJob(10L);

                assertEquals(1, result);

                verify(workloadJobDao)
                                .markScheduled(10L);
        }

        @Test
        void scheduleJob_shouldRejectInvalidState() {

                job.setStatus("RUNNING");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                assertThrows(
                                InvalidStateTransitionException.class,
                                () -> workloadJobService.scheduleJob(10L));

                verify(workloadJobDao, never())
                                .markScheduled(anyLong());
        }

        // ---------------------------------------------------------
        // startJob()
        // ---------------------------------------------------------

        @Test
        void startJob_shouldMoveScheduledToRunning() {

                job.setStatus("SCHEDULED");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                when(workloadJobDao.markRunning(
                                eq(10L),
                                any(Timestamp.class))).thenReturn(1);

                int result = workloadJobService.startJob(10L);

                assertEquals(1, result);

                verify(workloadJobDao)
                                .markRunning(
                                                eq(10L),
                                                any(Timestamp.class));
        }

        @Test
        void startJob_shouldRejectInvalidState() {

                job.setStatus("QUEUED");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                assertThrows(
                                InvalidStateTransitionException.class,
                                () -> workloadJobService.startJob(10L));

                verify(workloadJobDao, never())
                                .markRunning(
                                                anyLong(),
                                                any(Timestamp.class));
        }

        // ---------------------------------------------------------
        // completeJob()
        // ---------------------------------------------------------

        @Test
        void completeJob_shouldMoveRunningToCompleted() {

                job.setStatus("RUNNING");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                when(workloadJobDao.markCompleted(
                                eq(10L),
                                any(Timestamp.class))).thenReturn(1);

                int result = workloadJobService.completeJob(10L);

                assertEquals(1, result);

                verify(workloadJobDao)
                                .markCompleted(
                                                eq(10L),
                                                any(Timestamp.class));
        }

        // ---------------------------------------------------------
        // failJob()
        // ---------------------------------------------------------

        @Test
        void failJob_shouldMoveRunningToFailed() {

                job.setStatus("RUNNING");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                when(workloadJobDao.markFailed(10L))
                                .thenReturn(1);

                int result = workloadJobService.failJob(10L);

                assertEquals(1, result);

                verify(workloadJobDao)
                                .markFailed(10L);
        }

        // ---------------------------------------------------------
        // cancelJob()
        // ---------------------------------------------------------

        @Test
        void cancelJob_shouldCancelQueuedJob() {

                job.setStatus("QUEUED");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                when(workloadJobDao.markCancelled(10L))
                                .thenReturn(1);

                int result = workloadJobService.cancelJob(10L);

                assertEquals(1, result);

                verify(workloadJobDao)
                                .markCancelled(10L);
        }

        @Test
        void cancelJob_shouldCancelScheduledJob() {

                job.setStatus("SCHEDULED");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                when(workloadJobDao.markCancelled(10L))
                                .thenReturn(1);

                int result = workloadJobService.cancelJob(10L);

                assertEquals(1, result);

                verify(workloadJobDao)
                                .markCancelled(10L);
        }

        @Test
        void cancelJob_shouldCancelRunningJob() {

                job.setStatus("RUNNING");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                when(workloadJobDao.markCancelled(10L))
                                .thenReturn(1);

                int result = workloadJobService.cancelJob(10L);

                assertEquals(1, result);

                verify(workloadJobDao)
                                .markCancelled(10L);
        }

        @Test
        void cancelJob_shouldRejectCompletedJob() {

                job.setStatus("COMPLETED");

                when(workloadJobDao.findById(10L))
                                .thenReturn(job);

                assertThrows(
                                InvalidStateTransitionException.class,
                                () -> workloadJobService.cancelJob(10L));

                verify(workloadJobDao, never())
                                .markCancelled(anyLong());
        }

        // ---------------------------------------------------------
        // Missing ID
        // ---------------------------------------------------------

        @Test
        void scheduleJob_shouldRejectNullId() {

                assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.scheduleJob(null));

                verifyNoInteractions(workloadJobDao);
        }

        @Test
        void startJob_shouldRejectNullId() {

                assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.startJob(null));

                verifyNoInteractions(workloadJobDao);
        }

        @Test
        void completeJob_shouldRejectNullId() {

                assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.completeJob(null));

                verifyNoInteractions(workloadJobDao);
        }

        @Test
        void failJob_shouldRejectNullId() {

                assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.failJob(null));

                verifyNoInteractions(workloadJobDao);
        }

        @Test
        void cancelJob_shouldRejectNullId() {

                assertThrows(
                                IllegalArgumentException.class,
                                () -> workloadJobService.cancelJob(null));

                verifyNoInteractions(workloadJobDao);
        }
}
