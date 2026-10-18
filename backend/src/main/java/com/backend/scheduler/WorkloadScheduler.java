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

    private boolean isProcessing = false;

    @Scheduled(fixedDelay = 5000)
    public synchronized void processNextJob() {

        if (isProcessing) {
            return;
        }

        try {
            isProcessing = true;

            schedulerService.scheduleNextJob();

        } finally {
            isProcessing = false;
        }
    }

}