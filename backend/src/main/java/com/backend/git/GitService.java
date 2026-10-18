package com.backend.git;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;

@Service
public class GitService {

    private final Path workspaceDirectory = Paths.get("hostex-workspaces").toAbsolutePath();

    public String cloneRepository(
            Long applicationId,
            String repositoryUrl,
            String branch) {

        if (applicationId == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        if (repositoryUrl == null || repositoryUrl.isBlank()) {
            throw new IllegalArgumentException(
                    "Repository URL is required");
        }

        if (branch == null || branch.isBlank()) {
            throw new IllegalArgumentException(
                    "Git branch is required");
        }

        try {
            Files.createDirectories(workspaceDirectory);

            Path repositoryPath = workspaceDirectory.resolve(
                    "app-" + applicationId);

            deleteDirectory(repositoryPath);

            ProcessBuilder processBuilder = new ProcessBuilder(
                    "git",
                    "clone",
                    "--branch",
                    branch,
                    repositoryUrl,
                    repositoryPath.toString());

            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(
                            process.getInputStream()));

            StringBuilder output = new StringBuilder();

            String line;

            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                deleteDirectory(repositoryPath);

                throw new RuntimeException(
                        "Git clone failed: " + output);
            }

            return repositoryPath.toString();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to clone repository",
                    e);
        }
    }

    public void deleteWorkspace(Long applicationId) {

        if (applicationId == null) {
            throw new IllegalArgumentException(
                    "Application ID is required");
        }

        Path repositoryPath = workspaceDirectory.resolve(
                "app-" + applicationId);

        deleteDirectory(repositoryPath);
    }

    private void deleteDirectory(Path directory) {

        try {
            if (!Files.exists(directory)) {
                return;
            }

            try (var paths = Files.walk(directory)) {
                paths.sorted(Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (Exception e) {
                                throw new RuntimeException(
                                        "Failed to delete: " + path,
                                        e);
                            }
                        });
            }

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to delete workspace",
                    e);
        }
    }
}