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
            @RequestBody Application application,
            @RequestAttribute("authenticatedUserId") Long userId) {

        if (application == null) {
            throw new IllegalArgumentException("Application data is required");
        }
        application.setUserId(userId);

        return applicationService.createApplication(
                application);
    }

    @GetMapping("/{id}")
    public ApplicationResponse getById(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {

        applicationService.assertOwnedBy(id, userId);

        return applicationService.getApplication(id);
    }

    @GetMapping("/user/{userId}")
    public List<Application> getByUser(
            @PathVariable Long userId,
            @RequestAttribute("authenticatedUserId") Long authenticatedUserId) {

        if (!userId.equals(authenticatedUserId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN);
        }

        return applicationService.findByUserId(
                userId);
    }

    @PutMapping("/{id}")
    public Application update(
            @PathVariable Long id,
            @RequestBody Application application,
            @RequestAttribute("authenticatedUserId") Long userId) {

        applicationService.assertOwnedBy(id, userId);

        application.setId(id);
        application.setUserId(userId);

        return applicationService.updateApplication(
                application);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {

        applicationService.assertOwnedBy(id, userId);
        applicationService.deleteApplication(id);
    }

    @PostMapping("/{id}/deploy")
    public String deploy(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {
        applicationService.assertOwnedBy(id, userId);
        applicationService.deployApplication(id);

        return "Application will launch soon";
    }

    @PostMapping("/{id}/start")
    public ApplicationResponse start(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {

        applicationService.assertOwnedBy(id, userId);
        applicationService.startApplication(id);

        return applicationService.getApplication(id);
    }

    @PostMapping("/{id}/stop")
    public ApplicationResponse stop(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {

        applicationService.assertOwnedBy(id, userId);
        applicationService.stopApplication(id);

        return applicationService.getApplication(id);
    }

    @PostMapping("/{id}/restart")
    public ApplicationResponse restart(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {

        applicationService.assertOwnedBy(id, userId);
        applicationService.restartApplication(id);

        return applicationService.getApplication(id);
    }

    @GetMapping("/{id}/resources")
    public Map<String, String> getResourceUsage(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {
        applicationService.assertOwnedBy(id, userId);
        return applicationService.getResourceUsage(id);
    }

    @GetMapping("/{id}/logs")
    public String getApplicationLogs(
            @PathVariable Long id,
            @RequestAttribute("authenticatedUserId") Long userId) {
        applicationService.assertOwnedBy(id, userId);
        return applicationService.getApplicationLogs(id);
    }
}