package com.backend.service;

import com.backend.dao.UserDao;
import com.backend.exception.DuplicateResourceException;
import com.backend.exception.ResourceNotFoundException;
import com.backend.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserDao userDao;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_shouldCreateUser() {

        User user = new User();
        user.setName("John");
        user.setEmail("john@gmail.com");
        user.setPassword("password");

        when(userDao.existsByEmail(user.getEmail()))
                .thenReturn(false);

        when(userDao.createUser(user))
                .thenReturn(1);

        int result = userService.createUser(user);

        assertEquals(1, result);

        verify(userDao).existsByEmail(user.getEmail());
        verify(userDao).createUser(user);
    }

    @Test
    void createUser_shouldRejectNullUser() {

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(null));

        verifyNoInteractions(userDao);
    }

    @Test
    void createUser_shouldRejectMissingName() {

        User user = new User();
        user.setEmail("john@gmail.com");
        user.setPassword("password");

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(user));

        verifyNoInteractions(userDao);
    }

    @Test
    void createUser_shouldRejectMissingEmail() {

        User user = new User();
        user.setName("John");
        user.setPassword("password");

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(user));

        verifyNoInteractions(userDao);
    }

    @Test
    void createUser_shouldRejectMissingPassword() {

        User user = new User();
        user.setName("John");
        user.setEmail("john@gmail.com");

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(user));

        verifyNoInteractions(userDao);
    }

    @Test
    void createUser_shouldRejectDuplicateEmail() {

        User user = new User();
        user.setName("John");
        user.setEmail("john@gmail.com");
        user.setPassword("password");

        when(userDao.existsByEmail(user.getEmail()))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> userService.createUser(user));

        verify(userDao).existsByEmail(user.getEmail());
        verify(userDao, never()).createUser(any());
    }

    @Test
    void findById_shouldReturnUser() {

        User user = new User();
        user.setId(1L);
        user.setName("John");

        when(userDao.findById(1L))
                .thenReturn(user);

        User result = userService.findById(1L);

        assertEquals(user, result);

        verify(userDao).findById(1L);
    }

    @Test
    void findById_shouldThrowWhenUserDoesNotExist() {

        when(userDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.findById(1L));

        verify(userDao).findById(1L);
    }

    @Test
    void findById_shouldRejectNullId() {

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.findById(null));

        verifyNoInteractions(userDao);
    }

    @Test
    void findByEmail_shouldReturnUser() {

        User user = new User();
        user.setId(1L);
        user.setEmail("john@gmail.com");

        when(userDao.findByEmail("john@gmail.com"))
                .thenReturn(user);

        User result = userService.findByEmail("john@gmail.com");

        assertEquals(user, result);

        verify(userDao)
                .findByEmail("john@gmail.com");
    }

    @Test
    void findByEmail_shouldThrowWhenUserDoesNotExist() {

        when(userDao.findByEmail("john@gmail.com"))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.findByEmail("john@gmail.com"));

        verify(userDao)
                .findByEmail("john@gmail.com");
    }

    @Test
    void findByEmail_shouldRejectBlankEmail() {

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.findByEmail(" "));

        verifyNoInteractions(userDao);
    }

    @Test
    void findAll_shouldReturnUsers() {

        List<User> users = List.of(
                new User(),
                new User());

        when(userDao.findAll())
                .thenReturn(users);

        List<User> result = userService.findAll();

        assertEquals(2, result.size());
        assertEquals(users, result);

        verify(userDao).findAll();
    }

    @Test
    void updateUser_shouldUpdateUser() {

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setName("Old Name");
        existingUser.setEmail("john@gmail.com");
        existingUser.setPassword("oldPassword");

        User updatedUser = new User();
        updatedUser.setId(1L);
        updatedUser.setName("John");
        updatedUser.setEmail("john@gmail.com");
        updatedUser.setPassword("newPassword");

        when(userDao.findById(1L))
                .thenReturn(existingUser);

        when(userDao.updateUser(updatedUser))
                .thenReturn(1);

        int result = userService.updateUser(updatedUser);

        assertEquals(1, result);

        verify(userDao).findById(1L);
        verify(userDao).updateUser(updatedUser);

        verify(userDao, never())
                .existsByEmail(anyString());
    }

    @Test
    void updateUser_shouldRejectNullUser() {

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateUser(null));

        verifyNoInteractions(userDao);
    }

    @Test
    void updateUser_shouldRejectMissingId() {

        User user = new User();
        user.setName("John");
        user.setEmail("john@gmail.com");
        user.setPassword("password");

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateUser(user));

        verifyNoInteractions(userDao);
    }

    @Test
    void updateUser_shouldThrowWhenUserDoesNotExist() {

        User user = new User();
        user.setId(1L);
        user.setName("John");
        user.setEmail("john@gmail.com");
        user.setPassword("password");

        when(userDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateUser(user));

        verify(userDao).findById(1L);
        verify(userDao, never()).updateUser(any());
    }

    @Test
    void updateUser_shouldRejectDuplicateEmail() {

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setName("John");
        existingUser.setEmail("old@gmail.com");
        existingUser.setPassword("password");

        User updatedUser = new User();
        updatedUser.setId(1L);
        updatedUser.setName("John");
        updatedUser.setEmail("new@gmail.com");
        updatedUser.setPassword("password");

        when(userDao.findById(1L))
                .thenReturn(existingUser);

        when(userDao.existsByEmail("new@gmail.com"))
                .thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> userService.updateUser(updatedUser));

        verify(userDao).findById(1L);
        verify(userDao).existsByEmail("new@gmail.com");

        verify(userDao, never()).updateUser(any());
    }

    @Test
    void deleteUser_shouldDeleteUser() {

        User user = new User();
        user.setId(1L);

        when(userDao.findById(1L))
                .thenReturn(user);

        when(userDao.deleteUser(1L))
                .thenReturn(1);

        int result = userService.deleteUser(1L);

        assertEquals(1, result);

        verify(userDao).findById(1L);
        verify(userDao).deleteUser(1L);
    }

    @Test
    void deleteUser_shouldThrowWhenUserDoesNotExist() {

        when(userDao.findById(1L))
                .thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.deleteUser(1L));

        verify(userDao).findById(1L);
        verify(userDao, never()).deleteUser(any());
    }

    @Test
    void deleteUser_shouldRejectNullId() {

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.deleteUser(null));

        verifyNoInteractions(userDao);
    }
}