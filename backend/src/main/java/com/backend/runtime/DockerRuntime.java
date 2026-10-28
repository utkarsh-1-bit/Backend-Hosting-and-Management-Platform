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
            int containerPort,
            double cpuLimit,
            int memoryLimitMb) {

        if (cpuLimit <= 0 || memoryLimitMb <= 0) {
            throw new IllegalArgumentException(
                    "CPU and memory limits must be greater than zero");
        }

        return executeCommand(
                "docker",
                "run",
                "-d",
                "--cpus=" + cpuLimit,
                "--memory=" + memoryLimitMb + "m",
                "-p",
                hostPort + ":" + containerPort,
                imageName).trim();
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
        String logs = executeCommand(
                "docker", "logs",
                "--tail", "100",
                containerId);

        return logs.lines()
                .filter(line -> !line.contains("/docker-entrypoint.sh:") &&
                        !line.contains("/docker-entrypoint.d/") &&
                        !line.contains("Configuration complete; ready for start up") &&
                        !line.contains("using the \"epoll\" event method") &&
                        !line.contains("nginx/") &&
                        !line.contains("built by gcc") &&
                        !line.contains("OS: Linux") &&
                        !line.contains("getrlimit(RLIMIT_NOFILE)") &&
                        !line.contains("start worker process") &&
                        !line.contains("gracefully shutting down") &&
                        !line.contains("exiting") &&
                        !line.contains("exited with code") &&
                        !line.contains("signal ") &&
                        !line.equals("1#1: exit"))
                .collect(java.util.stream.Collectors.joining("\n"));
    }

    @Override
    public String getResourceUsage(String containerId) {
        return executeCommand(
                "docker", "stats",
                "--no-stream",
                "--format",
                "{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}",
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