package com.backend.dao;

import com.backend.dao.mapper.WorkloadJobRowMapper;
import com.backend.model.WorkloadJob;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class WorkloadJobDao {

    private final JdbcTemplate jdbcTemplate;

    public WorkloadJobDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long createJob(WorkloadJob job) {
        String sql = """
                INSERT INTO workload_jobs
                (application_id, job_type,
                 status, priority, burst_time)
                VALUES (?, ?, ?, ?, ?)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    sql,
                    new String[] { "id" });
            ps.setLong(1, job.getApplicationId()); // Adjust to setInt/setLong based on your ID type
            ps.setString(2, job.getJobType()); // Adjust if jobType is an Enum (e.g., job.getJobType().name())
            ps.setString(3, job.getStatus()); // Adjust if status is an Enum
            ps.setInt(4, job.getPriority());
            ps.setInt(5, job.getBurstTime());
            return ps;
        }, keyHolder);

        // Return the generated primary key
        return keyHolder.getKey().longValue();
    }

    public WorkloadJob findById(Long id) {

        String sql = """
                SELECT id, application_id,
                       job_type, status, priority,
                       arrival_time, burst_time,
                       start_time, completion_time
                FROM workload_jobs
                WHERE id = ?
                """;

        return jdbcTemplate.queryForObject(
                sql,
                new WorkloadJobRowMapper(),
                id);
    }

    public List<WorkloadJob> findByApplicationId(Long applicationId) {

        String sql = """
                SELECT id, application_id,
                       job_type, status, priority,
                       arrival_time, burst_time,
                       start_time, completion_time
                FROM workload_jobs
                WHERE application_id = ?
                ORDER BY arrival_time ASC
                """;

        return jdbcTemplate.query(
                sql,
                new WorkloadJobRowMapper(),
                applicationId);
    }

    public List<WorkloadJob> findQueuedJobs() {

        String sql = """
                SELECT id, application_id,
                       job_type, status, priority,
                       arrival_time, burst_time,
                       start_time, completion_time
                FROM workload_jobs
                WHERE status = 'QUEUED'
                ORDER BY arrival_time ASC
                """;

        return jdbcTemplate.query(
                sql,
                new WorkloadJobRowMapper());
    }

    public int updateStatus(Long id, String status) {

        String sql = """
                UPDATE workload_jobs
                SET status = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, status, id);
    }

    public int markScheduled(Long id) {

        String sql = """
                UPDATE workload_jobs
                SET status = 'SCHEDULED'
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, id);
    }

    public int markRunning(Long id, Timestamp startTime) {

        String sql = """
                UPDATE workload_jobs
                SET status = 'RUNNING',
                    start_time = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(
                sql,
                startTime,
                id);
    }

    public int markCompleted(Long id, Timestamp completionTime) {

        String sql = """
                UPDATE workload_jobs
                SET status = 'COMPLETED',
                    completion_time = ?
                WHERE id = ?
                """;

        return jdbcTemplate.update(
                sql,
                completionTime,
                id);
    }

    public int markFailed(Long id) {

        String sql = """
                UPDATE workload_jobs
                SET status = 'FAILED',
                    completion_time = CURRENT_TIMESTAMP
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, id);
    }

    public int markCancelled(Long id) {

        String sql = """
                UPDATE workload_jobs
                SET status = 'CANCELLED',
                    completion_time = CURRENT_TIMESTAMP
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, id);
    }

    public int deleteJob(Long id) {

        String sql = """
                DELETE FROM workload_jobs
                WHERE id = ?
                """;

        return jdbcTemplate.update(sql, id);
    }
}