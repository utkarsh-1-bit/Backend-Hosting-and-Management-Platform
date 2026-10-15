package com.backend.controller.dto;

import lombok.Data;

@Data
public class ApplicationResponse {

    private Long id;
    private String name;
    private String status;
    private String url;
}