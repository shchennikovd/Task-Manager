package com.taskmanager.backend.dto;

import java.util.Map;

public class AuthResponse {

    private String accessToken;
    private Map<String, Object> user;

    public AuthResponse(String accessToken, Map<String, Object> user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public Map<String, Object> getUser() {
        return user;
    }
}