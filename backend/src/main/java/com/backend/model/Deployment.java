package com.backend.model;

import lombok.Data;
import java.sql.Timestamp;

@Data 
public class Deployment {
    
    private Long id;
    private Long applicationId;
    private String commitHash;
    private String status;
    private Timestamp startedAt;
    private Timestamp completedAt;
    private String errorMessage;
}
