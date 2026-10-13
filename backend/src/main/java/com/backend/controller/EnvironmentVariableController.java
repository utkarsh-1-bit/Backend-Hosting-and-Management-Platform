package com.backend.controller;

import com.backend.model.EnvironmentVariable;
import com.backend.service.EnvironmentVariableService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/env")
public class EnvironmentVariableController {

    private final EnvironmentVariableService variableService;

    public EnvironmentVariableController(
            EnvironmentVariableService variableService) {

        this.variableService = variableService;
    }

    @PostMapping
    public EnvironmentVariable create(
            @PathVariable Long applicationId,
            @RequestBody EnvironmentVariable variable) {

        variable.setApplicationId(applicationId);

        return variableService.createVariable(variable);
    }

    @GetMapping
    public List<EnvironmentVariable> getAll(
            @PathVariable Long applicationId) {

        return variableService.findByApplicationId(
                applicationId);
    }

    @GetMapping("/{key}")
    public EnvironmentVariable getByKey(
            @PathVariable Long applicationId,
            @PathVariable String key) {

        return variableService.findByKey(
                applicationId,
                key);
    }

    @PutMapping("/{key}")
    public EnvironmentVariable update(
            @PathVariable Long applicationId,
            @PathVariable String key,
            @RequestBody EnvironmentVariable variable) {

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
            @PathVariable String key) {

        variableService.deleteByKey(
                applicationId, key);
    }
}