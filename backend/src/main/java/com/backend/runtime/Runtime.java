package com.backend.runtime;

public interface Runtime {
    String buildImage(
            String sourceDirectory,
            String imageName);

    void removeImage(String imageName);

    String createContainer(
            String imageName,
            int hostPort,
            int containerPort,
            double cpuLimit,
            int memoryLimitMb);

    void startContainer(String containerId);

    void stopContainer(String containerId);

    void removeContainer(String containerId);

    String getContainerStatus(String containerId);

    String getLogs(String containerId);

    String getResourceUsage(String containerId);

}
