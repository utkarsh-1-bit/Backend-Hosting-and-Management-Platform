package com.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class TokenService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private final byte[] secret;
    private final long tokenTtlSeconds;

    public TokenService(
            @Value("${hostex.auth.secret:}") String configuredSecret,
            @Value("${hostex.auth.token-ttl-seconds:3600}") long tokenTtlSeconds) {
        if (configuredSecret == null || configuredSecret.isBlank()) {
            this.secret = new byte[32];
            new SecureRandom().nextBytes(this.secret);
        } else {
            this.secret = configuredSecret.getBytes(StandardCharsets.UTF_8);
            if (this.secret.length < 32) {
                throw new IllegalArgumentException("HOSTEX_AUTH_SECRET must contain at least 32 bytes");
            }
        }
        this.tokenTtlSeconds = tokenTtlSeconds;
    }

    public String createToken(Long userId) {
        long expiresAt = Instant.now().getEpochSecond() + tokenTtlSeconds;
        String payload = userId + ":" + expiresAt;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return encodedPayload + "." + sign(encodedPayload);
    }

    public Long getUserId(String token) {
        try {
            String[] parts = token.split("\\.", -1);
            if (parts.length != 2 || !MessageDigest.isEqual(
                    sign(parts[0]).getBytes(StandardCharsets.US_ASCII),
                    parts[1].getBytes(StandardCharsets.US_ASCII))) {
                return null;
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String[] claims = payload.split(":", -1);
            if (claims.length != 2 || Long.parseLong(claims[1]) <= Instant.now().getEpochSecond()) {
                return null;
            }
            return Long.parseLong(claims[0]);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.US_ASCII)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign authentication token", exception);
        }
    }
}