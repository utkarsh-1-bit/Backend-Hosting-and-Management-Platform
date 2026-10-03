package com.backend.dao;

import com.backend.dao.mapper.EnvironmentVariableRowMapper;
import com.backend.model.EnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class EnvironmentVariableDao {

    private final JdbcTemplate jdbcTemplate;

    public EnvironmentVariableDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int createVariable(
            EnvironmentVariable variable) {

        String sql = """
                INSERT INTO environment_variables
                (application_id, variable_key, variable_value)
                VALUES (?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                variable.getApplicationId(),
                variable.getVariableKey(),
                variable.getVariableValue());
    }

    public EnvironmentVariable findById(Long id) {

        String sql = """
                SELECT id, application_id,
                       variable_key, variable_value,
                       created_at, updated_at
                FROM environment_variables
                WHERE id = ?
                """;

        return jdbcTemplate.queryForObject(
                sql,
                new EnvironmentVariableRowMapper(),
                id);
    }

    public EnvironmentVariable findByKey(
            Long applicationId,
            String variableKey) {

        String sql = """
                SELECT id, application_id,
                       variable_key, variable_value,
                       created_at, updated_at
                FROM environment_variables
                WHERE application_id = ?
                  AND variable_key = ?
                """;

        return jdbcTemplate.queryForObject(
                sql,
                new EnvironmentVariableRowMapper(),
                applicationId,
                variableKey);
    }

    public List<EnvironmentVariable> findByApplicationId(
            Long applicationId) {

        String sql = """
                SELECT id, application_id,
                       variable_key, variable_value,
                       created_at, updated_at
                FROM environment_variables
                WHERE application_id = ?
                ORDER BY variable_key ASC
                """;

        return jdbcTemplate.query(
                sql,
                new EnvironmentVariableRowMapper(),
                applicationId);
    }

    public int updateVariable(
            EnvironmentVariable variable) {

        String sql = """
                UPDATE environment_variables
                SET variable_value = ?
                WHERE application_id = ?
                  AND variable_key = ?
                """;

        return jdbcTemplate.update(
                sql,
                variable.getVariableValue(),
                variable.getApplicationId(),
                variable.getVariableKey());
    }

    public int deleteById(Long id) {

        String sql = """
                DELETE FROM environment_variables
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, id);
    }

    public int deleteByKey(
            Long applicationId,
            String variableKey) {

        String sql = """
                DELETE FROM environment_variables
                WHERE application_id = ?
                  AND variable_key = ?
                """;

        return jdbcTemplate.update(
                sql,
                applicationId,
                variableKey);
    }

    public boolean existsByKey(
            Long applicationId,
            String variableKey) {

        String sql = """
                SELECT COUNT(*)
                FROM environment_variables
                WHERE application_id = ?
                  AND variable_key = ?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                applicationId,
                variableKey);

        return count != null && count > 0;
    }
}