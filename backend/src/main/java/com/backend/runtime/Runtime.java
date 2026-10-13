package com.backend.runtime;

public interface Runtime {
    String buildImage(
            String sourceDirectory,
            String imageName);

    String createContainer(
            String imageName,
            int hostPort,
            int containerPort);

    void startContainer(
            String containerId);

    void stopContainer(
            String containerId);

    void removeContainer(
            String containerId);

    String getContainerStatus(
            String containerId);

    String getLogs(
            String containerId);
}
