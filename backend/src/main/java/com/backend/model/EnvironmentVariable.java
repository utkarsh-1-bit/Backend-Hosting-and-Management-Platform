package com.backend.model;

import lombok.Data;
import java.sql.Timestamp;

@Data 
public class EnvironmentVariable {
    
    private Long id;
    private Long applicationId;
    private String variableKey;
    private String variableValue;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
