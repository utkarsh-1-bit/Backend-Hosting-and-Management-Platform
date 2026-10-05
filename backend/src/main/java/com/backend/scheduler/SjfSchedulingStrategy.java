package com.backend.scheduler;

import com.backend.model.WorkloadJob;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SjfSchedulingStrategy implements SchedulingStrategy {

    @Override
    public WorkloadJob selectNextJob(List<WorkloadJob> jobs) {

        if (jobs == null || jobs.isEmpty()) {
            return null;
        }

        WorkloadJob selectedJob = jobs.get(0);

        for (WorkloadJob job : jobs) {

            if (job.getBurstTime() < selectedJob.getBurstTime()) {
                selectedJob = job;
            }
        }

        return selectedJob;
    }
}