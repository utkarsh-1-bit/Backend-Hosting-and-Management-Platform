package com.backend.model;

import lombok.Data;
import java.sql.Timestamp;

@Data 
public class Container {
    
    private Long id;
    private Long applicationId;
    private Long deploymentId;
    private String dockerContainerId;
    private String imageName;
    private String status;
    private Integer hostPort;
    private Integer containerPort;
    private Timestamp createdAt;
    private Timestamp startedAt;
    private Timestamp stoppedAt;
}
