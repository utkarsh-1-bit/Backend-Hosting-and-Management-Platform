package com.backend.scheduler.strategy;

import com.backend.model.WorkloadJob;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FcfsSchedulingStrategy implements SchedulingStrategy {

    @Override
    public WorkloadJob selectNextJob(List<WorkloadJob> jobs) {

        if (jobs == null || jobs.isEmpty()) {
            return null;
        }

        WorkloadJob selectedJob = jobs.get(0);

        for (int i = 1; i < jobs.size(); i++) {

            WorkloadJob currentJob = jobs.get(i);

            if (currentJob.getArrivalTime().before(
                    selectedJob.getArrivalTime())) {

                selectedJob = currentJob;
            }
        }

        return selectedJob;
    }
}