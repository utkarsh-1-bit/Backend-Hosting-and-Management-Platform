package com.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;

    public AuthenticationFilter(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return "/api/health".equals(path)
                || "/api/users/login".equals(path)
                || "/api/users/register".equals(path)
                || !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        Long userId = tokenService.getUserId(authorization.substring(7));
        if (userId == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired authentication token");
            return;
        }

        request.setAttribute("authenticatedUserId", userId);
        filterChain.doFilter(request, response);
    }
}