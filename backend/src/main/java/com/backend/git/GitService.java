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
            Process process = new ProcessBuilder(
                    "cmd.exe",
                    "/c",
                    "attrib",
                    "-R", "-S", "-H",
                    directory.toString() + "\\*",
                    "/S", "/D").redirectErrorStream(true).start();

            int exitCode = process.waitFor();

            if (exitCode != 0) {
                throw new IOException(
                        "Failed to remove file attributes from " + directory);
            }

            Files.walkFileTree(directory, new SimpleFileVisitor<>() {

                @Override
                public FileVisitResult visitFile(
                        Path file,
                        BasicFileAttributes attributes) throws IOException {

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

                    Files.delete(dir);
                    return FileVisitResult.CONTINUE;
                }
            });

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete workspace: " + directory, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(
                    "Interrupted while deleting workspace: " + directory, e);
        }
    }
}
