package com.backend.controller.dto;

import com.backend.model.User;

import lombok.Getter;

@Getter
public class UserReponse {
    Long id;
    String name;
    String email;

    public UserReponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
    }
}
