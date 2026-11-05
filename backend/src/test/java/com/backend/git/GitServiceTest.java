package com.backend.git;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GitServiceTest {

    private final GitService gitService = new GitService();

    @Test
    void acceptsCredentialFreeHttpsRepositories() {
        assertDoesNotThrow(() -> gitService.validateRepositoryUrl("https://github.com/acme/service.git"));
    }

    @Test
    void rejectsNonHttpsAndCredentialBearingRepositories() {
        assertThrows(IllegalArgumentException.class,
                () -> gitService.validateRepositoryUrl("file:///local/repo"));
        assertThrows(IllegalArgumentException.class,
                () -> gitService.validateRepositoryUrl("https://user:password@example.com/repo.git"));
    }
}
