package com.backend.dao;

import com.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

@SpringBootTest
class UserDaoTest {

    @Autowired
    private UserDao userDao;

    @Test
    void createAndFindUser() {

        User user = new User();

        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("test123");

        int rows = userDao.createUser(user);

        assertEquals(1, rows);

        User savedUser = userDao.findByEmail("test@example.com");

        assertNotNull(savedUser);
        assertEquals("Test User", savedUser.getName());
        assertEquals("test@example.com", savedUser.getEmail());
    }

    @Test
    void findUserById() {

        User user = new User();

        user.setName("Find Test");
        user.setEmail("find@example.com");
        user.setPassword("test123");

        userDao.createUser(user);

        User savedUser = userDao.findByEmail("find@example.com");

        User foundUser = userDao.findById(savedUser.getId());

        assertNotNull(foundUser);
        assertEquals(savedUser.getId(), foundUser.getId());
        assertEquals("find@example.com", foundUser.getEmail());
    }

    @Test
    void findAllUsers() {

        List<User> users = userDao.findAll();

        assertNotNull(users);
        assertFalse(users.isEmpty());
    }

    @Test
    void updateUser() {

        User user = new User();

        user.setName("Before Update");
        user.setEmail("update@example.com");
        user.setPassword("test123");

        userDao.createUser(user);

        User savedUser = userDao.findByEmail("update@example.com");

        savedUser.setName("After Update");

        int rows = userDao.updateUser(savedUser);

        assertEquals(1, rows);

        User updatedUser = userDao.findById(savedUser.getId());

        assertEquals("After Update", updatedUser.getName());
    }

    @Test
    void emailExists() {

        assertTrue(userDao.existsByEmail("test@example.com"));
        assertFalse(userDao.existsByEmail("doesnotexist@example.com"));
    }

    @Test
    void deleteUser() {

        User user = new User();

        user.setName("Delete Test");
        user.setEmail("delete@example.com");
        user.setPassword("test123");

        userDao.createUser(user);

        User savedUser = userDao.findByEmail("delete@example.com");

        int rows = userDao.deleteUser(savedUser.getId());

        assertEquals(1, rows);

        assertFalse(userDao.existsByEmail("delete@example.com"));
    }

}
