package com.backend.git;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.net.URI;

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

        validateRepositoryUrl(repositoryUrl);

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

            StringBuilder output = new StringBuilder();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {

                String line;

                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
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
                    "Failed to clone repository for application "
                            + applicationId + ": " + e.getMessage(),
                    e);
        }
    }

    public void validateRepositoryUrl(String repositoryUrl) {
        try {
            URI uri = URI.create(repositoryUrl);
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || uri.getHost() == null
                    || uri.getRawUserInfo() != null) {
                throw new IllegalArgumentException("Repository URL must be a credential-free HTTPS URL");
            }
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("Invalid repository URL", exception);
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
        if (!Files.exists(directory)) {
            return;
        }

        try {
            Files.walkFileTree(directory, new SimpleFileVisitor<>() {

                @Override
                public FileVisitResult visitFile(
                        Path file,
                        BasicFileAttributes attributes) throws IOException {

                    clearReadOnlyAttribute(file);
                    Files.delete(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(
                        Path dir,
                        IOException exception) throws IOException {

                    if (exception != null) {
                        throw exception;
                    }

                    clearReadOnlyAttribute(dir);
                    Files.delete(dir);
                    return FileVisitResult.CONTINUE;
                }
            });

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete workspace: " + directory, e);
        }
    }

    private void clearReadOnlyAttribute(Path path) throws IOException {
        if (System.getProperty("os.name", "").toLowerCase().startsWith("windows")) {
            Files.setAttribute(path, "dos:readonly", false);
        }
    }
}
