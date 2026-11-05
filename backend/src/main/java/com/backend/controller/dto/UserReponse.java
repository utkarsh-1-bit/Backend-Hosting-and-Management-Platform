package com.backend.controller.dto;

import com.backend.model.User;

import lombok.Getter;

@Getter
public class UserReponse {
    private final Long id;
    private final String name;
    private final String email;
    private final String token;

    public UserReponse(User user, String token) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.token = token;
    }
}
