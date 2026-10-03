package com.backend.dao.mapper;

import com.backend.model.Application;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ApplicationRowMapper implements RowMapper<Application> {

    @Override
    public Application mapRow(ResultSet rs, int rowNum) throws SQLException {

        Application application = new Application();

        application.setId(rs.getLong("id"));
        application.setUserId(rs.getLong("user_id"));
        application.setName(rs.getString("name"));
        application.setRepositoryUrl(rs.getString("repository_url"));
        application.setBranch(rs.getString("branch"));
        application.setBuildCommand(rs.getString("build_command"));
        application.setStartCommand(rs.getString("start_command"));
        application.setStatus(rs.getString("status"));
        application.setCreatedAt(rs.getTimestamp("created_at"));
        application.setUpdatedAt(rs.getTimestamp("updated_at"));

        return application;
    }
}