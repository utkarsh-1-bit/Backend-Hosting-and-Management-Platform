package com.backend.model;

import lombok.Data;
import java.sql.Timestamp;

@Data 
public class User {
    private Long id;
    private String name;
    private String email;
    private String password;
    private Timestamp createdAt;
 
}
