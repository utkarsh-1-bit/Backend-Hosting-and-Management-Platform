package com.backend.controller;

import com.backend.controller.dto.LoginRequest;
import com.backend.controller.dto.UserReponse;
import com.backend.model.User;
import com.backend.service.UserService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserReponse register(
            @RequestBody User user) {

        return userService.register(user);
    }

    @PostMapping("/login")
    public UserReponse login(
            @RequestBody LoginRequest req) {

        return userService.login(req);
    }
}