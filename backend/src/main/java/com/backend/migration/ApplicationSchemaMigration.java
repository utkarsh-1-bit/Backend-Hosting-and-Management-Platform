package com.backend.migration;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Component
public class ApplicationSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public ApplicationSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        Set<String> columns = jdbcTemplate.execute((ConnectionCallback<Set<String>>) connection -> {
            Set<String> existingColumns = new HashSet<>();
            DatabaseMetaData metadata = connection.getMetaData();
            String tableName = null;
            String tableSchema = null;
            try (ResultSet tables = metadata.getTables(
                    connection.getCatalog(), null, null, new String[] { "TABLE" })) {
                while (tables.next()) {
                    if ("applications".equalsIgnoreCase(tables.getString("TABLE_NAME"))) {
                        tableName = tables.getString("TABLE_NAME");
                        tableSchema = tables.getString("TABLE_SCHEM");
                        break;
                    }
                }
            }
            if (tableName != null) {
                try (ResultSet resultSet = metadata.getColumns(
                        connection.getCatalog(), tableSchema, tableName, null)) {
                    while (resultSet.next()) {
                        existingColumns.add(resultSet.getString("COLUMN_NAME").toLowerCase(Locale.ROOT));
                    }
                }
            }
            return existingColumns;
        });

        if (columns == null || columns.isEmpty()) {
            return;
        }

        if (!columns.contains("plan")) {
            jdbcTemplate.execute(
                    "ALTER TABLE applications ADD COLUMN plan VARCHAR(30) NOT NULL DEFAULT 'BASIC'");
        }
        if (!columns.contains("container_port")) {
            jdbcTemplate.execute(
                    "ALTER TABLE applications ADD COLUMN container_port INT NOT NULL DEFAULT 8080");
        }
    }
}
