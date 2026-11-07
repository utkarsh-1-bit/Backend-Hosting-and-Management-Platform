package com.backend.controller;

import com.backend.model.WorkloadJob;
import com.backend.service.ApplicationService;
import com.backend.service.WorkloadJobService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class WorkloadJobController {

    private final WorkloadJobService jobService;
    private final ApplicationService applicationService;

    public WorkloadJobController(WorkloadJobService jobService, ApplicationService applicationService) {
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<WorkloadJob> getJobs(@RequestAttribute("authenticatedUserId") Long userId) {
        return jobService.findByUserId(userId);
    }

    @PostMapping
    public WorkloadJob createJob(
            @RequestBody WorkloadJob job,
            @RequestAttribute("authenticatedUserId") Long userId) {
        if (job == null || job.getApplicationId() == null) {
            throw new IllegalArgumentException("Application ID is required");
        }
        applicationService.assertOwnedBy(job.getApplicationId(), userId);
        return jobService.createJob(job);
    }

    @DeleteMapping("/{id}")
    public void cancelJob(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {
        WorkloadJob job = jobService.findById(id);
        applicationService.assertOwnedBy(job.getApplicationId(), userId);
        jobService.cancelJob(id);
    }
}