package com.backend.dao.mapper;

import com.backend.model.Deployment;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class DeploymentRowMapper implements RowMapper<Deployment> {

    @Override
    public Deployment mapRow(ResultSet rs, int rowNum) throws SQLException {

        Deployment deployment = new Deployment();

        deployment.setId(rs.getLong("id"));
        deployment.setApplicationId(rs.getLong("application_id"));
        deployment.setCommitHash(rs.getString("commit_hash"));
        deployment.setStatus(rs.getString("status"));
        deployment.setStartedAt(rs.getTimestamp("started_at"));
        deployment.setCompletedAt(rs.getTimestamp("completed_at"));
        deployment.setErrorMessage(rs.getString("error_message"));

        return deployment;
    }
}