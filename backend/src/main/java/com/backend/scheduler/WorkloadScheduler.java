package com.backend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "hostex.scheduler.enabled", havingValue = "true", matchIfMissing = true)
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