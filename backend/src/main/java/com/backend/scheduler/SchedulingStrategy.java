package com.backend.scheduler;

import com.backend.model.WorkloadJob;

import java.util.List;

public interface SchedulingStrategy {

    WorkloadJob selectNextJob(List<WorkloadJob> jobs);
}