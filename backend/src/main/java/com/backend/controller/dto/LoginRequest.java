package com.backend.controller.dto;

import lombok.Getter;

@Getter
public class LoginRequest {
    String email;
    String password;
}
