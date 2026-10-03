package com.backend.dao.mapper;

import com.backend.model.WorkloadJob;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class WorkloadJobRowMapper implements RowMapper<WorkloadJob> {

    @Override
    public WorkloadJob mapRow(ResultSet rs, int rowNum) throws SQLException {

        WorkloadJob job = new WorkloadJob();

        job.setId(rs.getLong("id"));
        job.setApplicationId(rs.getLong("application_id"));
        job.setDeploymentId(rs.getLong("deployment_id"));
        job.setJobType(rs.getString("job_type"));
        job.setStatus(rs.getString("status"));
        job.setPriority(rs.getInt("priority"));
        job.setArrivalTime(rs.getTimestamp("arrival_time"));
        job.setBurstTime(rs.getInt("burst_time"));
        job.setStartTime(rs.getTimestamp("start_time"));
        job.setCompletionTime(rs.getTimestamp("completion_time"));

        return job;
    }
}