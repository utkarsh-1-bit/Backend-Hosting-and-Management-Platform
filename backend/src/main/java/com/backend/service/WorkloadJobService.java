package com.backend.service;

import com.backend.dao.ApplicationDao;
import com.backend.dao.WorkloadJobDao;
import com.backend.exception.InvalidStateTransitionException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.WorkloadJob;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class WorkloadJobService {

    private final WorkloadJobDao workloadJobDao;
    private final ApplicationDao applicationDao;

    public WorkloadJobService(
            WorkloadJobDao workloadJobDao,
            ApplicationDao applicationDao) {

        this.workloadJobDao = workloadJobDao;
        this.applicationDao = applicationDao;
    }

    public Long createJob(WorkloadJob job) {

        if (job == null) {
            throw new IllegalArgumentException(
                    "Workload job cannot be null");
        }

        if (job.getApplicationId() == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        if (job.getJobType() == null ||
                job.getJobType().isBlank()) {

            throw new IllegalArgumentException(
                    "Job type is required");
        }

        if (!isValidJobType(job.getJobType())) {
            throw new IllegalArgumentException(
                    "Invalid job type: " + job.getJobType());
        }

        if (applicationDao.findById(job.getApplicationId()) == null) {
            throw new ResourceNotFoundException(
                    "Application not found with id: "
                            + job.getApplicationId());
        }

        // Every newly created job starts in QUEUED state.
        job.setStatus("QUEUED");

        return workloadJobDao.createJob(job);
    }

    public int updateStatus(Long id, String newStatus) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Workload job ID is required");
        }

        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException(
                    "Workload job status is required");
        }

        WorkloadJob job = getJob(id);

        validateTransition(
                job.getStatus(),
                newStatus);

        return workloadJobDao.updateStatus(
                id,
                newStatus);
    }

    public int scheduleJob(Long id) {

        WorkloadJob job = getJob(id);

        validateTransition(
                job.getStatus(),
                "SCHEDULED");

        return workloadJobDao.markScheduled(id);
    }

    public int startJob(Long id) {

        WorkloadJob job = getJob(id);

        validateTransition(
                job.getStatus(),
                "RUNNING");

        return workloadJobDao.markRunning(
                id,
                new Timestamp(System.currentTimeMillis()));
    }

    public int completeJob(Long id) {

        WorkloadJob job = getJob(id);

        validateTransition(
                job.getStatus(),
                "COMPLETED");

        return workloadJobDao.markCompleted(
                id,
                new Timestamp(System.currentTimeMillis()));
    }

    public int failJob(Long id) {

        WorkloadJob job = getJob(id);

        validateTransition(
                job.getStatus(),
                "FAILED");

        return workloadJobDao.markFailed(id);
    }

    public int cancelJob(Long id) {

        WorkloadJob job = getJob(id);

        validateTransition(
                job.getStatus(),
                "CANCELLED");

        return workloadJobDao.markCancelled(id);
    }

    private boolean isValidJobType(String jobType) {

        return switch (jobType) {
            case "BUILD", "DEPLOY", "RESTART" -> true;
            default -> false;
        };
    }

    private void validateTransition(
            String currentStatus,
            String newStatus) {

        boolean valid = switch (currentStatus) {

            case "QUEUED" ->
                newStatus.equals("SCHEDULED")
                        || newStatus.equals("CANCELLED");

            case "SCHEDULED" ->
                newStatus.equals("RUNNING")
                        || newStatus.equals("CANCELLED");

            case "RUNNING" ->
                newStatus.equals("COMPLETED")
                        || newStatus.equals("FAILED")
                        || newStatus.equals("CANCELLED");

            case "COMPLETED",
                    "FAILED",
                    "CANCELLED" ->
                false;

            default ->
                false;
        };

        if (!valid) {
            throw new InvalidStateTransitionException(
                    "Invalid workload job state transition: "
                            + currentStatus
                            + " -> "
                            + newStatus);
        }
    }

    private WorkloadJob getJob(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Workload job ID is required");
        }

        WorkloadJob job = workloadJobDao.findById(id);

        if (job == null) {
            throw new ResourceNotFoundException(
                    "Workload job not found with id: " + id);
        }

        return job;
    }
}
