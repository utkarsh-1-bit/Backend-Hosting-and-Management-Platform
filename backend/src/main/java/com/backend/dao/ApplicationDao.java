package com.backend.dao;

import com.backend.dao.mapper.ApplicationRowMapper;
import com.backend.model.Application;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ApplicationDao {

    private final JdbcTemplate jdbcTemplate;

    public ApplicationDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 1. CREATE
    public int createApplication(Application application) {

        String sql = """
                INSERT INTO applications
                (user_id, name, repository_url, branch,
                 build_command, start_command, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                application.getUserId(),
                application.getName(),
                application.getRepositoryUrl(),
                application.getBranch(),
                application.getBuildCommand(),
                application.getStartCommand(),
                application.getStatus());
    }

    // 2. FIND BY ID
    public Application findById(Long id) {

        String sql = """
                SELECT id, user_id, name, repository_url, branch,
                       build_command, start_command, status,
                       created_at, updated_at
                FROM applications
                WHERE id = ?
                """;

        return jdbcTemplate.queryForObject(
                sql,
                new ApplicationRowMapper(),
                id);
    }

    // 3. FIND ALL APPLICATIONS OF A USER
    public List<Application> findByUserId(Long userId) {

        String sql = """
                SELECT id, user_id, name, repository_url, branch,
                       build_command, start_command, status,
                       created_at, updated_at
                FROM applications
                WHERE user_id = ?
                ORDER BY created_at DESC
                """;

        return jdbcTemplate.query(
                sql,
                new ApplicationRowMapper(),
                userId);
    }

    // 4. FIND ALL
    public List<Application> findAll() {

        String sql = """
                SELECT id, user_id, name, repository_url, branch,
                       build_command, start_command, status,
                       created_at, updated_at
                FROM applications
                ORDER BY created_at DESC
                """;

        return jdbcTemplate.query(
                sql,
                new ApplicationRowMapper());
    }

    // 5. UPDATE
    public int updateApplication(Application application) {

        String sql = """
                UPDATE applications
                SET name = ?,
                    repository_url = ?,
                    branch = ?,
                    build_command = ?,
                    start_command = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(
                sql,
                application.getName(),
                application.getRepositoryUrl(),
                application.getBranch(),
                application.getBuildCommand(),
                application.getStartCommand(),
                application.getId());
    }

    // 6. UPDATE STATUS
    public int updateStatus(Long id, String status) {

        String sql = """
                UPDATE applications
                SET status = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, status, id);
    }

    // 7. DELETE
    public int deleteApplication(Long id) {

        String sql = """
                DELETE FROM applications
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, id);
    }

    // 8. CHECK APPLICATION NAME FOR USER
    public boolean existsByNameForUser(Long userId, String name) {

        String sql = """
                SELECT COUNT(*)
                FROM applications
                WHERE user_id = ?
                  AND name = ?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                userId,
                name);

        return count != null && count > 0;
    }
}