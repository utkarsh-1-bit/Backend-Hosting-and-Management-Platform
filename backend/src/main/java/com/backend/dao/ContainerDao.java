package com.backend.dao;

import com.backend.dao.mapper.ContainerRowMapper;
import com.backend.model.Container;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class ContainerDao {

        private final JdbcTemplate jdbcTemplate;

        public ContainerDao(JdbcTemplate jdbcTemplate) {
                this.jdbcTemplate = jdbcTemplate;
        }

        public int createContainer(Container container) {

                String sql = """
                                INSERT INTO containers
                                (application_id,
                                 docker_container_id, image_name,
                                 status, host_port, container_port)
                                VALUES (?, ?, ?, ?, ?, ?)
                                """;

                return jdbcTemplate.update(
                                sql,
                                container.getApplicationId(),
                                container.getDockerContainerId(),
                                container.getImageName(),
                                container.getStatus(),
                                container.getHostPort(),
                                container.getContainerPort());
        }

        public Container findById(Long id) {

                String sql = """
                                SELECT id, application_id,
                                       docker_container_id, image_name,
                                       status, host_port, container_port,
                                       created_at, started_at, stopped_at
                                FROM containers
                                WHERE id = ?
                                """;

                return jdbcTemplate.queryForObject(
                                sql,
                                new ContainerRowMapper(),
                                id);
        }

        public Container findByDockerContainerId(
                        String dockerContainerId) {

                String sql = """
                                SELECT id, application_id,
                                       docker_container_id, image_name,
                                       status, host_port, container_port,
                                       created_at, started_at, stopped_at
                                FROM containers
                                WHERE docker_container_id = ?
                                """;

                return jdbcTemplate.queryForObject(
                                sql,
                                new ContainerRowMapper(),
                                dockerContainerId);
        }

        public List<Container> findByApplicationId(
                        Long applicationId) {

                String sql = """
                                SELECT id, application_id,
                                       docker_container_id, image_name,
                                       status, host_port, container_port,
                                       created_at, started_at, stopped_at
                                FROM containers
                                WHERE application_id = ?
                                ORDER BY id DESC
                                """;

                return jdbcTemplate.query(
                                sql,
                                new ContainerRowMapper(),
                                applicationId);
        }

        public Container findRunningByApplicationId(
                        Long applicationId) {

                String sql = """
                                SELECT id, application_id,
                                       docker_container_id, image_name,
                                       status, host_port, container_port,
                                       created_at, started_at, stopped_at
                                FROM containers
                                WHERE application_id = ?
                                  AND status = 'RUNNING'
                                ORDER BY id DESC
                                LIMIT 1
                                """;

                return jdbcTemplate.queryForObject(
                                sql,
                                new ContainerRowMapper(),
                                applicationId);
        }

        public int updateStatus(Long id, String status) {

                String sql = """
                                UPDATE containers
                                SET status = ?
                                WHERE id = ?
                                """;

                return jdbcTemplate.update(sql, status, id);
        }

        public int markStarted(Long id, Timestamp startedAt) {

                String sql = """
                                UPDATE containers
                                SET status = 'RUNNING',
                                    started_at = ?
                                WHERE id = ?
                                """;

                return jdbcTemplate.update(
                                sql,
                                startedAt,
                                id);
        }

        public int markStopped(Long id, Timestamp stoppedAt) {

                String sql = """
                                UPDATE containers
                                SET status = 'STOPPED',
                                    stopped_at = ?
                                WHERE id = ?
                                """;

                return jdbcTemplate.update(
                                sql,
                                stoppedAt,
                                id);
        }

        public int markCrashed(Long id) {

                String sql = """
                                UPDATE containers
                                SET status = 'CRASHED'
                                WHERE id = ?
                                """;

                return jdbcTemplate.update(sql, id);
        }

        public int deleteContainer(Long id) {

                String sql = """
                                DELETE FROM containers
                                WHERE id = ?
                                """;

                return jdbcTemplate.update(sql, id);
        }
}