package com.backend.service;

import com.backend.dao.UserDao;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserDao userDao;

    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public int createUser(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null");
        }

        if (user.getName() == null ||
                user.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "User name is required");
        }

        if (user.getEmail() == null ||
                user.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "User email is required");
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "User password is required");
        }

        if (userDao.existsByEmail(user.getEmail())) {
            throw new DuplicateResourceException(
                    "User already exists with email: "
                            + user.getEmail());
        }

        return userDao.createUser(user);
    }

    public User findById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "User ID is required");
        }

        User user = userDao.findById(id);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found with id: " + id);
        }

        return user;
    }

    public User findByEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "User email is required");
        }

        User user = userDao.findByEmail(email);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found with email: " + email);
        }

        return user;
    }

    public List<User> findAll() {
        return userDao.findAll();
    }

    public int updateUser(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null");
        }

        if (user.getId() == null) {
            throw new IllegalArgumentException(
                    "User ID is required");
        }

        if (user.getName() == null ||
                user.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "User name is required");
        }

        if (user.getEmail() == null ||
                user.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "User email is required");
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "User password is required");
        }

        User existingUser = userDao.findById(user.getId());

        if (existingUser == null) {
            throw new ResourceNotFoundException(
                    "User not found with id: " + user.getId());
        }

        if (!existingUser.getEmail().equals(user.getEmail())
                && userDao.existsByEmail(user.getEmail())) {

            throw new DuplicateResourceException(
                    "User already exists with email: "
                            + user.getEmail());
        }

        return userDao.updateUser(user);
    }

    public int deleteUser(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "User ID is required");
        }

        User existingUser = userDao.findById(id);

        if (existingUser == null) {
            throw new ResourceNotFoundException(
                    "User not found with id: " + id);
        }

        return userDao.deleteUser(id);
    }
}