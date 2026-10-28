package com.backend.controller;

import com.backend.controller.dto.ApplicationResponse;
import com.backend.model.Application;
import com.backend.service.ApplicationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService) {

        this.applicationService = applicationService;
    }

    @PostMapping
    public Application create(
            @RequestBody Application application) {

        return applicationService.createApplication(
                application);
    }

    @GetMapping("/{id}")
    public ApplicationResponse getById(
            @PathVariable Long id) {

        return applicationService.getApplication(id);
    }

    @GetMapping("/user/{userId}")
    public List<Application> getByUser(
            @PathVariable Long userId) {

        return applicationService.findByUserId(
                userId);
    }

    @PutMapping("/{id}")
    public Application update(
            @PathVariable Long id,
            @RequestBody Application application) {

        application.setId(id);

        return applicationService.updateApplication(
                application);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id) {

        applicationService.deleteApplication(id);
    }

    @PostMapping("/{id}/deploy")
    public String deploy(@PathVariable Long id) {
        applicationService.deployApplication(id);

        return "Application will launch soon";
    }

    @PostMapping("/{id}/start")
    public ApplicationResponse start(
            @PathVariable Long id) {

        applicationService.startApplication(id);

        return getById(id);
    }

    @PostMapping("/{id}/stop")
    public ApplicationResponse stop(
            @PathVariable Long id) {

        applicationService.stopApplication(id);

        return getById(id);
    }

    @PostMapping("/{id}/restart")
    public ApplicationResponse restart(
            @PathVariable Long id) {

        applicationService.restartApplication(id);

        return getById(id);
    }

    @GetMapping("/{id}/resources")
    public Map<String, String> getResourceUsage(
            @PathVariable Long id) {
        return applicationService.getResourceUsage(id);
    }

    @GetMapping("/{id}/logs")
    public String getApplicationLogs(@PathVariable Long id) {
        return applicationService.getApplicationLogs(id);
    }
}