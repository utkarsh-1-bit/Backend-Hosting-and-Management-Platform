package com.backend.service;

import com.backend.controller.dto.LoginRequest;
import com.backend.controller.dto.UserReponse;
import com.backend.dao.UserDao;
import com.backend.exception.AuthenticationFailedException;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.User;
import com.backend.security.TokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Locale;

@Service
public class UserService {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public UserService(
            UserDao userDao,
            PasswordEncoder passwordEncoder,
            TokenService tokenService) {

        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public UserReponse register(User user) {

        if (user == null ||
                user.getName() == null ||
                user.getEmail() == null ||
                user.getPassword() == null ||
                user.getName().isBlank() ||
                user.getEmail().isBlank() ||
                user.getPassword().length() < 10 ||
                user.getPassword().length() > 72) {

            throw new IllegalArgumentException(
                    "Name and email are required; password must be between 10 and 72 characters");
        }

        user.setName(user.getName().trim());
        user.setEmail(user.getEmail().trim().toLowerCase(Locale.ROOT));

        if (userDao.existsByEmail(user.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already exists");
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()));

        userDao.createUser(user);

        User registeredUser = userDao.findByEmail(user.getEmail());
        return new UserReponse(registeredUser, tokenService.createToken(registeredUser.getId()));
    }

    public UserReponse login(LoginRequest req) {

        if (req == null || req.getEmail() == null || req.getPassword() == null) {
            throw new AuthenticationFailedException("Invalid email or password");
        }

        User user = userDao.findByEmail(req.getEmail().trim().toLowerCase(Locale.ROOT));

        if (user == null ||
                !passwordEncoder.matches(
                        req.getPassword(),
                        user.getPassword())) {

            throw new AuthenticationFailedException(
                    "Invalid email or password");
        }

        return new UserReponse(user, tokenService.createToken(user.getId()));
    }

    public User findById(Long id) {

        User user = userDao.findById(id);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found");
        }

        return user;
    }
}