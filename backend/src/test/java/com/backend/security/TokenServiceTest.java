package com.backend.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class TokenServiceTest {

    private static final String SECRET = "test-secret-with-at-least-thirty-two-bytes";

    @Test
    void createsAndValidatesTokenForUser() {
        TokenService tokenService = new TokenService(SECRET, 60);
        String token = tokenService.createToken(42L);

        assertEquals(42L, tokenService.getUserId(token));
    }

    @Test
    void rejectsTamperedAndExpiredTokens() {
        TokenService tokenService = new TokenService(SECRET, 60);
        String token = tokenService.createToken(42L);
        TokenService expiredTokenService = new TokenService(SECRET, -1);

        assertNull(tokenService.getUserId(token + "x"));
        assertNull(expiredTokenService.getUserId(expiredTokenService.createToken(42L)));
    }
}
