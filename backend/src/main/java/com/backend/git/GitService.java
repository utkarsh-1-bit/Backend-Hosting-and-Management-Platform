package com.backend.git;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class GitService {

    private final String workspaceDirectory = "mini-render-workspaces";

    public String cloneRepository(
            String repositoryUrl,
            String branch) {

        if (repositoryUrl == null ||
                repositoryUrl.isBlank()) {

            throw new IllegalArgumentException(
                    "Repository URL is required");
        }

        if (branch == null ||
                branch.isBlank()) {

            throw new IllegalArgumentException(
                    "Git branch is required");
        }

        try {

            Path workspace = Paths.get(workspaceDirectory);

            Files.createDirectories(workspace);

            String folderName = UUID.randomUUID().toString();

            Path repositoryPath = workspace.resolve(folderName);

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

                throw new RuntimeException(
                        "Git clone failed: "
                                + output);
            }

            return repositoryPath
                    .toAbsolutePath()
                    .toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to clone repository",
                    e);
        }
    }
}