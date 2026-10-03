package com.backend.dao.mapper;

import com.backend.model.Container;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ContainerRowMapper implements RowMapper<Container> {

    @Override
    public Container mapRow(ResultSet rs, int rowNum) throws SQLException {

        Container container = new Container();

        container.setId(rs.getLong("id"));
        container.setApplicationId(rs.getLong("application_id"));
        container.setDeploymentId(rs.getLong("deployment_id"));
        container.setDockerContainerId(
                rs.getString("docker_container_id"));
        container.setImageName(rs.getString("image_name"));
        container.setStatus(rs.getString("status"));
        container.setHostPort(rs.getInt("host_port"));
        container.setContainerPort(rs.getInt("container_port"));
        container.setCreatedAt(rs.getTimestamp("created_at"));
        container.setStartedAt(rs.getTimestamp("started_at"));
        container.setStoppedAt(rs.getTimestamp("stopped_at"));

        return container;
    }
}