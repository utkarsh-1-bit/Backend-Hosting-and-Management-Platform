package com.backend.model;

public enum HostingPlan {

    BASIC(0.5, 512),
    STANDARD(1.0, 1024),
    PREMIUM(2.0, 2048);

    private final double cpuLimit;
    private final int memoryLimitMb;

    HostingPlan(double cpuLimit, int memoryLimitMb) {
        this.cpuLimit = cpuLimit;
        this.memoryLimitMb = memoryLimitMb;
    }

    public double getCpuLimit() {
        return cpuLimit;
    }

    public int getMemoryLimitMb() {
        return memoryLimitMb;
    }
}