package com.backend.controller;

import com.backend.controller.dto.ApplicationResponse;
import com.backend.model.Application;
import com.backend.service.ApplicationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/{id}/start")
    public Application start(
            @PathVariable Long id) {

        applicationService.startApplication(id);

        return applicationService.findById(id);
    }

    @PostMapping("/{id}/stop")
    public Application stop(
            @PathVariable Long id) {

        applicationService.stopApplication(id);

        return applicationService.findById(id);
    }

    @PostMapping("/{id}/restart")
    public Application restart(
            @PathVariable Long id) {

        applicationService.restartApplication(id);

        return applicationService.findById(id);
    }
}