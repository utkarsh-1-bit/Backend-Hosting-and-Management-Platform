package com.backend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WorkloadScheduler {

    private final SchedulerService schedulerService;

    public WorkloadScheduler(
            SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @Scheduled(fixedDelay = 5000)
    public void processNextJob() {

        schedulerService.scheduleNextJob();
    }
}