package com.backend.scheduler;

import com.backend.dao.WorkloadJobDao;
import com.backend.model.WorkloadJob;
import com.backend.scheduler.strategy.FcfsSchedulingStrategy;
import com.backend.scheduler.strategy.PrioritySchedulingStrategy;
import com.backend.scheduler.strategy.SchedulingStrategy;
import com.backend.scheduler.strategy.SjfSchedulingStrategy;
import com.backend.service.WorkloadJobService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchedulerService {

    private final WorkloadJobDao jobDao;
    private final WorkloadJobService jobService;
    private final WorkloadExecutor workloadExecutor;
    private final SchedulingStrategy strategy;

    public SchedulerService(
            WorkloadJobDao jobDao,
            WorkloadJobService jobService,
            WorkloadExecutor workloadExecutor,
            FcfsSchedulingStrategy fcfs,
            SjfSchedulingStrategy sjf,
            PrioritySchedulingStrategy priority,
            @Value("${hostex.scheduler.algorithm}") String algorithm) {

        this.jobDao = jobDao;
        this.jobService = jobService;
        this.workloadExecutor = workloadExecutor;

        if ("SJF".equalsIgnoreCase(algorithm)) {
            strategy = sjf;
        } else if ("PRIORITY".equalsIgnoreCase(algorithm)) {
            strategy = priority;
        } else {
            strategy = fcfs;
        }
    }

    public void scheduleNextJob() {

        List<WorkloadJob> jobs = jobDao.findQueuedJobs();

        if (jobs.isEmpty()) {
            return;
        }

        WorkloadJob job = strategy.selectNextJob(jobs);

        jobService.scheduleJob(job.getId());

        workloadExecutor.execute(job);
    }
}