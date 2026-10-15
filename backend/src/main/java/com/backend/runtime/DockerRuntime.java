package com.backend.runtime;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Component
public class DockerRuntime implements Runtime {

    @Override
    public String buildImage(
            String sourceDirectory,
            String imageName) {

        return executeCommand(
                "docker",
                "build",
                "-t",
                imageName,
                sourceDirectory);
    }

    @Override
    public void removeImage(String imageName) {
        executeCommand("docker", "rmi", imageName);
    }

    @Override
    public String createContainer(
            String imageName,
            int hostPort,
            int containerPort) {

        return executeCommand(
                "docker",
                "run",
                "-d",
                "-p",
                hostPort + ":" + containerPort,
                imageName);
    }

    @Override
    public void startContainer(String containerId) {

        executeCommand(
                "docker",
                "start",
                containerId);
    }

    @Override
    public void stopContainer(String containerId) {

        executeCommand(
                "docker",
                "stop",
                containerId);
    }

    @Override
    public void removeContainer(String containerId) {

        executeCommand(
                "docker",
                "rm",
                containerId);
    }

    @Override
    public String getContainerStatus(String containerId) {

        return executeCommand(
                "docker",
                "inspect",
                "-f",
                "{{.State.Status}}",
                containerId);
    }

    @Override
    public String getLogs(String containerId) {

        return executeCommand(
                "docker",
                "logs",
                containerId);
    }

    private String executeCommand(String... command) {

        try {

            ProcessBuilder processBuilder = new ProcessBuilder(command);

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
                        "Docker command failed: "
                                + output);
            }

            return output.toString().trim();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to execute Docker command",
                    e);
        }
    }
}