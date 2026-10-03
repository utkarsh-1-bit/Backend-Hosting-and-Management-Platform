package com.backend.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

import com.backend.model.User;
import com.backend.dao.mapper.UserRowMapper;

@Repository
public class UserDao {

    private final JdbcTemplate jdbcTemplate;

    public UserDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 1 create user
    public int createUser(User user) {
        String sql = """
                INSERT INTO users (name, email, password)
                VALUES (?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                user.getName(),
                user.getEmail(),
                user.getPassword());
    }

    // 2. Find by email
    public User findByEmail(String email) {
        String sql = """
                SELECT id, name, email, password, created_at
                FROM users
                WHERE email = ?
                """;

        return jdbcTemplate.queryForObject(
                sql,
                new UserRowMapper(),
                email);
    }

    // 3. Find by ID
    public User findById(Long id) {

        String sql = """
                SELECT id, name, email, password, created_at
                FROM users
                WHERE id = ?
                """;

        return jdbcTemplate.queryForObject(
                sql,
                new UserRowMapper(),
                id);
    }

    // 4. Find all Users
    public List<User> findAll() {

        String sql = """
                SELECT id, name, email, password, created_at
                FROM users
                """;

        return jdbcTemplate.query(
                sql,
                new UserRowMapper());
    }

    // 5. Update Users
    public int updateUser(User user) {

        String sql = """
                UPDATE users
                SET name = ?, email = ?, password = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(
                sql,
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getId());
    }

    // 6. Delete User
    public int deleteUser(Long id) {

        String sql = """
                DELETE FROM users
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, id);
    }

    // 7. Check for User by Email
    public boolean existsByEmail(String email) {

        String sql = """
                SELECT COUNT(*)
                FROM users
                WHERE email = ?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                email);

        return count != null && count > 0;
    }

}
