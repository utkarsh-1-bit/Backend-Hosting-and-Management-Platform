package com.backend.model;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class WorkloadJob {
    
    private Long id;
    private Long applicationId;
    private String jobType;
    private String status;
    private Integer priority;
    private Timestamp arrivalTime;
    private Integer burstTime;
    private Timestamp startTime;
    private Timestamp completionTime;
}
