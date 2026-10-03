package com.backend.model;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class Application {
    
    private Long id;
    private Long userId;
    private String name;
    private String repositoryUrl;
    private String branch;
    private String buildCommand;
    private String startCommand;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
