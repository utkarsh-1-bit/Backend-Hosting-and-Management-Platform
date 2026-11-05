package com.backend.runtime;

import com.backend.model.EnvironmentVariable;
import java.util.List;

public interface Runtime {
    default void verifyAvailable() {
    }

    String buildImage(
            String sourceDirectory,
            String imageName);

    List<Integer> getExposedPorts(String imageName);

    void removeImage(String imageName);

    String createContainer(
            String imageName,
            int hostPort,
            int containerPort,
            double cpuLimit,
            int memoryLimitMb,
            String startCommand,
            List<EnvironmentVariable> environmentVariables);

    void startContainer(String containerId);

    void stopContainer(String containerId);

    void removeContainer(String containerId);

    String getContainerStatus(String containerId);

    String getLogs(String containerId);

    String getResourceUsage(String containerId);

}
