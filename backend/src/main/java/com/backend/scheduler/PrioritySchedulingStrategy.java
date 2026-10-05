package com.backend.scheduler;

import com.backend.model.WorkloadJob;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PrioritySchedulingStrategy implements SchedulingStrategy {

    @Override
    public WorkloadJob selectNextJob(List<WorkloadJob> jobs) {

        if (jobs == null || jobs.isEmpty()) {
            return null;
        }

        WorkloadJob selectedJob = jobs.get(0);

        for (WorkloadJob job : jobs) {

            if (job.getPriority() < selectedJob.getPriority()) {
                selectedJob = job;
            }
        }

        return selectedJob;
    }
}