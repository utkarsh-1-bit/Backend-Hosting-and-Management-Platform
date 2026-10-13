package com.backend.service;

import com.backend.controller.dto.LoginRequest;
import com.backend.controller.dto.UserReponse;
import com.backend.dao.UserDao;
import com.backend.exception.AuthenticationFailedException;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserDao userDao,
            PasswordEncoder passwordEncoder) {

        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
    }

    public UserReponse register(User user) {

        if (user == null ||
                user.getName() == null ||
                user.getEmail() == null ||
                user.getPassword() == null) {

            throw new IllegalArgumentException(
                    "Invalid user data");
        }

        if (userDao.existsByEmail(user.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already exists");
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()));

        userDao.createUser(user);

        return new UserReponse(userDao.findByEmail(user.getEmail()));
    }

    public UserReponse login(LoginRequest req) {

        User user = userDao.findByEmail(req.getEmail());

        if (user == null ||
                !passwordEncoder.matches(
                        req.getPassword(),
                        user.getPassword())) {

            throw new AuthenticationFailedException(
                    "Invalid email or password");
        }

        return new UserReponse(user);
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