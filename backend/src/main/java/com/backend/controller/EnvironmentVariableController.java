package com.backend.controller;

import com.backend.model.EnvironmentVariable;
import com.backend.service.EnvironmentVariableService;
import com.backend.service.ApplicationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/env")
public class EnvironmentVariableController {

    private final EnvironmentVariableService variableService;
        private final ApplicationService applicationService;

    public EnvironmentVariableController(
                        EnvironmentVariableService variableService,
                        ApplicationService applicationService) {

        this.variableService = variableService;
                this.applicationService = applicationService;
    }

    @PostMapping
    public EnvironmentVariable create(
            @PathVariable Long applicationId,
                        @RequestBody EnvironmentVariable variable,
                        @RequestAttribute("authenticatedUserId") Long userId) {

                applicationService.assertOwnedBy(applicationId, userId);
                if (variable == null) {
                        throw new IllegalArgumentException("Environment variable data is required");
                }
        variable.setApplicationId(applicationId);

        return variableService.createVariable(variable);
    }

    @GetMapping
    public List<EnvironmentVariable> getAll(
                        @PathVariable Long applicationId,
                        @RequestAttribute("authenticatedUserId") Long userId) {

                applicationService.assertOwnedBy(applicationId, userId);
        return variableService.findByApplicationId(
                applicationId);
    }

    @GetMapping("/{key}")
    public EnvironmentVariable getByKey(
            @PathVariable Long applicationId,
                        @PathVariable String key,
                        @RequestAttribute("authenticatedUserId") Long userId) {

                applicationService.assertOwnedBy(applicationId, userId);
        return variableService.findByKey(
                applicationId,
                key);
    }

    @PutMapping("/{key}")
    public EnvironmentVariable update(
            @PathVariable Long applicationId,
            @PathVariable String key,
                        @RequestBody EnvironmentVariable variable,
                        @RequestAttribute("authenticatedUserId") Long userId) {

                applicationService.assertOwnedBy(applicationId, userId);
                if (variable == null) {
                        throw new IllegalArgumentException("Environment variable data is required");
                }
        EnvironmentVariable existing = variableService.findByKey(
                applicationId, key);

        variable.setId(existing.getId());
        variable.setApplicationId(applicationId);
        variable.setVariableKey(key);

        variableService.updateVariable(variable);

        return variableService.findById(
                existing.getId());
    }

    @DeleteMapping("/{key}")
    public void delete(
            @PathVariable Long applicationId,
                        @PathVariable String key,
                        @RequestAttribute("authenticatedUserId") Long userId) {

                applicationService.assertOwnedBy(applicationId, userId);
        variableService.deleteByKey(
                applicationId, key);
    }
}