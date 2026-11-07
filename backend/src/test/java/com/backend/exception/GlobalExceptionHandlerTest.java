package com.backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    @Test
    void preservesStatusCodeFromResponseStatusException() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        var response = handler.handleResponseStatus(
                new ResponseStatusException(HttpStatus.FORBIDDEN));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals(403, response.getBody().get("status"));
    }
}
