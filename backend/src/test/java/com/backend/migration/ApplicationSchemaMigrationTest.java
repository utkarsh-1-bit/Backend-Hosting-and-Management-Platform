package com.backend.migration;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.h2.jdbcx.JdbcDataSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ApplicationSchemaMigrationTest {

    @Test
    void addsMissingApplicationColumnsAndCanRunMoreThanOnce() {
        JdbcDataSource dataSource = new JdbcDataSource();
        dataSource.setURL("jdbc:h2:mem:application-schema-migration;DB_CLOSE_DELAY=-1");
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.execute("CREATE TABLE applications (id BIGINT PRIMARY KEY)");

        ApplicationSchemaMigration migration = new ApplicationSchemaMigration(jdbcTemplate);
        migration.run(null);
        migration.run(null);

        jdbcTemplate.update("INSERT INTO applications (id) VALUES (?)", 1L);
        assertEquals("BASIC", jdbcTemplate.queryForObject(
                "SELECT plan FROM applications WHERE id = 1", String.class));
        assertEquals(8080, jdbcTemplate.queryForObject(
                "SELECT container_port FROM applications WHERE id = 1", Integer.class));
    }
}
