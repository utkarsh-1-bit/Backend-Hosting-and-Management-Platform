package com.backend.runtime;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import com.backend.model.EnvironmentVariable;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class DockerRuntime implements Runtime {

    private final String dockerExecutable;

    public DockerRuntime(@Value("${hostex.docker.executable:docker}") String dockerExecutable) {
        this.dockerExecutable = resolveDockerExecutable(dockerExecutable);
    }

    private String resolveDockerExecutable(String executable) {
        if ("docker".equalsIgnoreCase(executable)
                && System.getProperty("os.name", "").toLowerCase(java.util.Locale.ROOT).contains("win")) {
            String programFiles = System.getenv("ProgramFiles");
            if (programFiles != null) {
                Path standardInstall = Path.of(
                        programFiles, "Docker", "Docker", "resources", "bin", "docker.exe");
                if (Files.isRegularFile(standardInstall)) {
                    return standardInstall.toString();
                }
            }
        }
        return executable;
    }

    @Override
    public void verifyAvailable() {
        executeCommand("info", "--format", "{{.ServerVersion}}");
    }

    @Override
    public String buildImage(
            String sourceDirectory,
            String imageName) {

        return executeCommand(
                "build",
                "-t",
                imageName,
                sourceDirectory);
    }

    @Override
    public List<Integer> getExposedPorts(String imageName) {
        String exposedPorts = executeCommand(
                "image",
                "inspect",
                "--format",
                "{{range $port, $_ := .Config.ExposedPorts}}{{$port}} {{end}}",
                imageName);
        if (exposedPorts.isBlank()) {
            return List.of();
        }

        return exposedPorts.lines()
                .flatMap(line -> java.util.Arrays.stream(line.trim().split("\\s+")))
                .map(port -> port.substring(0, port.indexOf('/')))
                .map(Integer::parseInt)
                .distinct()
                .toList();
    }

    @Override
    public void removeImage(String imageName) {
        executeCommand("rmi", imageName);
    }

    @Override
    public String createContainer(
            String imageName,
            int hostPort,
            int containerPort,
            double cpuLimit,
            int memoryLimitMb,
            String startCommand,
            List<EnvironmentVariable> environmentVariables) {

        if (cpuLimit <= 0 || memoryLimitMb <= 0) {
            throw new IllegalArgumentException(
                    "CPU and memory limits must be greater than zero");
        }

        List<String> command = new ArrayList<>(List.of(
                "run", "-d",
                "--cpus=" + cpuLimit,
                "--memory=" + memoryLimitMb + "m",
                "--pids-limit=256",
                "--cap-drop=ALL",
                "--cap-add=CHOWN",
                "--cap-add=SETUID",
                "--cap-add=SETGID",
                "--cap-add=NET_BIND_SERVICE",
                "--security-opt=no-new-privileges",
                "-p", hostPort + ":" + containerPort));

        for (EnvironmentVariable variable : environmentVariables) {
            command.add("--env");
            command.add(variable.getVariableKey() + "=" + variable.getVariableValue());
        }

        boolean hasStartCommand = startCommand != null && !startCommand.isBlank();
        if (hasStartCommand) {
            command.add("--entrypoint");
            command.add("/bin/sh");
        }
        command.add(imageName);
        if (hasStartCommand) {
            command.add("-c");
            command.add(startCommand);
        }

        return executeCommand(command.toArray(String[]::new)).trim();
    }

    @Override
    public void startContainer(String containerId) {

        executeCommand(
                "start",
                containerId);
    }

    @Override
    public void stopContainer(String containerId) {

        executeCommand(
                "stop",
                containerId);
    }

    @Override
    public void removeContainer(String containerId) {

        executeCommand(
                "rm",
                containerId);
    }

    @Override
    public String getContainerStatus(String containerId) {

        return executeCommand(
                "inspect",
                "-f",
                "{{.State.Status}}",
                containerId);
    }

    @Override
    public String getLogs(String containerId) {
        String logs = executeCommand(
                "logs",
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
                "stats",
                "--no-stream",
                "--format",
                "{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}",
                containerId);
    }

    private String executeCommand(String... command) {

        List<String> fullCommand = new ArrayList<>(command.length + 1);
        fullCommand.add(dockerExecutable);
        fullCommand.addAll(List.of(command));
        ProcessBuilder processBuilder = new ProcessBuilder(fullCommand);
        processBuilder.redirectErrorStream(true);
        addExecutableDirectoryToPath(processBuilder, dockerExecutable);

        Process process;
        try {
            process = processBuilder.start();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Docker CLI executable '" + dockerExecutable
                            + "' could not be started. Install Docker Desktop/Engine and ensure the Docker CLI is on PATH, "
                            + "or configure DOCKER_CLI_PATH with the full path to docker.exe.",
                    exception);
        }

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append(System.lineSeparator());
            }
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new IllegalStateException(
                        "Docker command '" + String.join(" ", fullCommand)
                                + "' failed with exit code " + exitCode + ": " + output.toString().trim());
            }
            return output.toString().trim();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed while reading Docker command output", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while waiting for Docker command", exception);
        }
    }

    static void addExecutableDirectoryToPath(ProcessBuilder processBuilder, String executable) {
        Path executableDirectory = Path.of(executable).getParent();
        if (executableDirectory == null) {
            return;
        }

        var environment = processBuilder.environment();
        String path = environment.getOrDefault("PATH", "");
        boolean alreadyIncluded = List.of(path.split(java.util.regex.Pattern.quote(File.pathSeparator)))
                .stream()
                .anyMatch(entry -> entry.equalsIgnoreCase(executableDirectory.toString()));

        if (!alreadyIncluded) {
            environment.put("PATH", executableDirectory + File.pathSeparator + path);
        }
    }
}