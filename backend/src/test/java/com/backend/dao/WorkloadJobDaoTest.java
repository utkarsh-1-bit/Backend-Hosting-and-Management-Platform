package com.backend.dao;

import com.backend.model.Application;
import com.backend.model.User;
import com.backend.model.WorkloadJob;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Timestamp;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class WorkloadJobDaoTest {

        @Autowired
        private WorkloadJobDao workloadJobDao;

        @Autowired
        private UserDao userDao;

        @Autowired
        private ApplicationDao applicationDao;

        private Long createTestUser() {

                User user = new User();

                user.setName("Workload Test User");
                user.setEmail(
                                "workload" + System.nanoTime() + "@test.com");
                user.setPassword("password");

                userDao.createUser(user);

                return userDao.findByEmail(user.getEmail()).getId();
        }

        private Long createTestApplication() {

                Long userId = createTestUser();

                Application application = new Application();

                application.setUserId(userId);
                application.setName(
                                "workload-app-" + System.nanoTime());
                application.setRepositoryUrl(
                                "https://github.com/test/workload");
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

        private Long createTestJob() {

                Long applicationId = createTestApplication();

                WorkloadJob job = new WorkloadJob();

                job.setApplicationId(applicationId);
                job.setJobType("BUILD");
                job.setStatus("QUEUED");
                job.setPriority(1);
                job.setBurstTime(30);

                workloadJobDao.createJob(job);

                return workloadJobDao
                                .findByApplicationId(applicationId)
                                .get(0)
                                .getId();
        }

        @Test
        void createAndFindJob() {

                Long applicationId = createTestApplication();

                WorkloadJob job = new WorkloadJob();

                job.setApplicationId(applicationId);
                job.setJobType("BUILD");
                job.setStatus("QUEUED");
                job.setPriority(1);
                job.setBurstTime(30);

                int rows = workloadJobDao.createJob(job);

                assertEquals(1, rows);

                WorkloadJob saved = workloadJobDao
                                .findByApplicationId(applicationId)
                                .get(0);

                assertNotNull(saved);
                assertEquals(applicationId, saved.getApplicationId());
                assertEquals("BUILD", saved.getJobType());
                assertEquals("QUEUED", saved.getStatus());
                assertEquals(1, saved.getPriority());
                assertEquals(30, saved.getBurstTime());
        }

        @Test
        void findJobById() {

                Long jobId = createTestJob();

                WorkloadJob job = workloadJobDao.findById(jobId);

                assertNotNull(job);
                assertEquals(jobId, job.getId());
        }

        @Test
        void findJobsByApplicationId() {

                Long applicationId = createTestApplication();

                WorkloadJob job1 = new WorkloadJob();

                job1.setApplicationId(applicationId);
                job1.setJobType("BUILD");
                job1.setStatus("QUEUED");
                job1.setPriority(1);
                job1.setBurstTime(30);

                WorkloadJob job2 = new WorkloadJob();

                job2.setApplicationId(applicationId);
                job2.setJobType("DEPLOY");
                job2.setStatus("QUEUED");
                job2.setPriority(2);
                job2.setBurstTime(15);

                workloadJobDao.createJob(job1);
                workloadJobDao.createJob(job2);

                List<WorkloadJob> jobs = workloadJobDao
                                .findByApplicationId(applicationId);

                assertEquals(2, jobs.size());
        }

        @Test
        void findQueuedJobs() {

                Long applicationId = createTestApplication();

                WorkloadJob job = new WorkloadJob();

                job.setApplicationId(applicationId);
                job.setJobType("BUILD");
                job.setStatus("QUEUED");
                job.setPriority(1);
                job.setBurstTime(30);

                workloadJobDao.createJob(job);

                List<WorkloadJob> queuedJobs = workloadJobDao.findQueuedJobs();

                assertFalse(queuedJobs.isEmpty());

                assertTrue(
                                queuedJobs.stream()
                                                .allMatch(
                                                                j -> "QUEUED"
                                                                                .equals(j.getStatus())));
        }

        @Test
        void updateJobStatus() {

                Long jobId = createTestJob();

                int rows = workloadJobDao.updateStatus(
                                jobId,
                                "SCHEDULED");

                assertEquals(1, rows);

                WorkloadJob job = workloadJobDao.findById(jobId);

                assertEquals("SCHEDULED", job.getStatus());
        }

        @Test
        void markJobScheduled() {

                Long jobId = createTestJob();

                int rows = workloadJobDao.markScheduled(jobId);

                assertEquals(1, rows);

                WorkloadJob job = workloadJobDao.findById(jobId);

                assertEquals("SCHEDULED", job.getStatus());
        }

        @Test
        void markJobRunning() {

                Long jobId = createTestJob();

                Timestamp startTime = new Timestamp(System.currentTimeMillis());

                int rows = workloadJobDao.markRunning(
                                jobId,
                                startTime);

                assertEquals(1, rows);

                WorkloadJob job = workloadJobDao.findById(jobId);

                assertEquals("RUNNING", job.getStatus());
                assertNotNull(job.getStartTime());
        }

        @Test
        void markJobCompleted() {

                Long jobId = createTestJob();

                Timestamp completionTime = new Timestamp(System.currentTimeMillis());

                int rows = workloadJobDao.markCompleted(
                                jobId,
                                completionTime);

                assertEquals(1, rows);

                WorkloadJob job = workloadJobDao.findById(jobId);

                assertEquals("COMPLETED", job.getStatus());
                assertNotNull(job.getCompletionTime());
        }

        @Test
        void markJobFailed() {

                Long jobId = createTestJob();

                int rows = workloadJobDao.markFailed(jobId);

                assertEquals(1, rows);

                WorkloadJob job = workloadJobDao.findById(jobId);

                assertEquals("FAILED", job.getStatus());
                assertNotNull(job.getCompletionTime());
        }

        @Test
        void markJobCancelled() {

                Long jobId = createTestJob();

                int rows = workloadJobDao.markCancelled(jobId);

                assertEquals(1, rows);

                WorkloadJob job = workloadJobDao.findById(jobId);

                assertEquals("CANCELLED", job.getStatus());
                assertNotNull(job.getCompletionTime());
        }

        @Test
        void deleteJob() {

                Long jobId = createTestJob();

                int rows = workloadJobDao.deleteJob(jobId);

                assertEquals(1, rows);

                assertThrows(
                                Exception.class,
                                () -> workloadJobDao.findById(jobId));
        }
}