package com.backend.runtime;

import org.junit.jupiter.api.Test;

import java.io.File;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DockerRuntimeTest {

    @Test
    void reportsActionableMessageWhenDockerCliCannotBeStarted() {
        DockerRuntime runtime = new DockerRuntime(
                "E:\\missing-docker-cli\\docker.exe");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                runtime::verifyAvailable);

        assertTrue(exception.getMessage().contains("Install Docker Desktop/Engine"));
        assertTrue(exception.getMessage().contains("DOCKER_CLI_PATH"));
    }

    @Test
    void addsDockerExecutableDirectoryToChildProcessPath() {
        String dockerPath = java.nio.file.Path.of("Docker", "bin", "docker.exe")
                .toAbsolutePath()
                .toString();
        String dockerDirectory = java.nio.file.Path.of(dockerPath).getParent().toString();
        ProcessBuilder processBuilder = new ProcessBuilder("docker", "info");
        String existingPath = System.getProperty("java.io.tmpdir");
        processBuilder.environment().put("PATH", existingPath);

        DockerRuntime.addExecutableDirectoryToPath(processBuilder, dockerPath);

        String path = processBuilder.environment().get("PATH");
        assertTrue(path.startsWith(dockerDirectory + File.pathSeparator));
        assertTrue(path.endsWith(existingPath));
    }

}
