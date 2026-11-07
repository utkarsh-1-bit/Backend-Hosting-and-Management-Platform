package com.backend.controller;

import com.backend.model.WorkloadJob;
import com.backend.scheduler.SchedulerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/scheduler")
public class SchedulerController {

    private final SchedulerService schedulerService;

    public SchedulerController(SchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @GetMapping("/queue")
    public List<WorkloadJob> previewQueue(
            @RequestParam(defaultValue = "FCFS") String algorithm,
            @RequestAttribute("authenticatedUserId") Long userId) {
        return schedulerService.previewQueue(userId, algorithm);
    }
}