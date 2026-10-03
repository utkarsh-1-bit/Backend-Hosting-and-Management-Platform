package com.backend.dao;

import com.backend.dao.mapper.DeploymentRowMapper;
import com.backend.model.Deployment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class DeploymentDao {

    private final JdbcTemplate jdbcTemplate;

    public DeploymentDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int createDeployment(Deployment deployment) {

        String sql = """
                INSERT INTO deployments
                (application_id, commit_hash, status)
                VALUES (?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                deployment.getApplicationId(),
                deployment.getCommitHash(),
                deployment.getStatus());
    }

    public Deployment findById(Long id) {

        String sql = """
                SELECT id, application_id, commit_hash, status,
                       started_at, completed_at, error_message
                FROM deployments
                WHERE id = ?
                """;

        return jdbcTemplate.queryForObject(
                sql,
                new DeploymentRowMapper(),
                id);
    }

    public List<Deployment> findByApplicationId(Long applicationId) {

        String sql = """
                SELECT id, application_id, commit_hash, status,
                       started_at, completed_at, error_message
                FROM deployments
                WHERE application_id = ?
                ORDER BY id DESC
                """;

        return jdbcTemplate.query(
                sql,
                new DeploymentRowMapper(),
                applicationId);
    }

    public Deployment findLatestByApplicationId(Long applicationId) {

        String sql = """
                SELECT id, application_id, commit_hash, status,
                       started_at, completed_at, error_message
                FROM deployments
                WHERE application_id = ?
                ORDER BY id DESC
                LIMIT 1
                """;

        return jdbcTemplate.queryForObject(
                sql,
                new DeploymentRowMapper(),
                applicationId);
    }

    public int updateStatus(Long id, String status) {

        String sql = """
                UPDATE deployments
                SET status = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, status, id);
    }

    public int markStarted(Long id, java.sql.Timestamp startedAt) {

        String sql = """
                UPDATE deployments
                SET status = 'BUILDING',
                    started_at = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, startedAt, id);
    }

    public int markCompleted(Long id, java.sql.Timestamp completedAt) {

        String sql = """
                UPDATE deployments
                SET status = 'DEPLOYED',
                    completed_at = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, completedAt, id);
    }

    public int markFailed(Long id, String errorMessage) {

        String sql = """
                UPDATE deployments
                SET status = 'FAILED',
                    error_message = ?,
                    completed_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, errorMessage, id);
    }

    public int deleteDeployment(Long id) {

        String sql = """
                DELETE FROM deployments
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, id);
    }
}