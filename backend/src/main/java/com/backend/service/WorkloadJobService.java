package com.backend.service;

import com.backend.dao.WorkloadJobDao;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.WorkloadJob;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class WorkloadJobService {

    private final WorkloadJobDao jobDao;

    public WorkloadJobService(WorkloadJobDao jobDao) {
        this.jobDao = jobDao;
    }

    public WorkloadJob createJob(WorkloadJob job) {

        if (job == null ||
                job.getApplicationId() == null) {

            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        if (!"DEPLOY".equals(job.getJobType()) &&
                !"RESTART".equals(job.getJobType())) {

            throw new IllegalArgumentException(
                    "Invalid job type");
        }

        job.setStatus("QUEUED");

        job.setArrivalTime(
                new Timestamp(System.currentTimeMillis()));

        Long id = jobDao.createJob(job);

        return findById(id);
    }

    public WorkloadJob findById(Long id) {

        WorkloadJob job = jobDao.findById(id);

        if (job == null) {
            throw new ResourceNotFoundException(
                    "Job not found");
        }

        return job;
    }

    public List<WorkloadJob> findByApplicationId(
            Long applicationId) {

        return jobDao.findByApplicationId(applicationId);
    }

    public List<WorkloadJob> findQueuedJobs() {

        return jobDao.findQueuedJobs();
    }

    public void scheduleJob(Long id) {

        findById(id);
        jobDao.markScheduled(id);
    }

    public void startJob(Long id) {

        findById(id);

        jobDao.markRunning(
                id,
                new Timestamp(System.currentTimeMillis()));
    }

    public void completeJob(Long id) {

        findById(id);

        jobDao.markCompleted(
                id,
                new Timestamp(System.currentTimeMillis()));
    }

    public void failJob(Long id) {

        findById(id);
        jobDao.markFailed(id);
    }

    public void cancelJob(Long id) {

        findById(id);
        jobDao.markCancelled(id);
    }

    public void deleteJob(Long id) {

        findById(id);
        jobDao.deleteJob(id);
    }
}