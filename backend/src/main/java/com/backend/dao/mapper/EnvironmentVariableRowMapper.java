package com.backend.dao.mapper;

import com.backend.model.EnvironmentVariable;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class EnvironmentVariableRowMapper
        implements RowMapper<EnvironmentVariable> {

    @Override
    public EnvironmentVariable mapRow(
            ResultSet rs,
            int rowNum) throws SQLException {

        EnvironmentVariable variable = new EnvironmentVariable();

        variable.setId(rs.getLong("id"));
        variable.setApplicationId(
                rs.getLong("application_id"));
        variable.setVariableKey(
                rs.getString("variable_key"));
        variable.setVariableValue(
                rs.getString("variable_value"));
        variable.setCreatedAt(
                rs.getTimestamp("created_at"));
        variable.setUpdatedAt(
                rs.getTimestamp("updated_at"));

        return variable;
    }
}