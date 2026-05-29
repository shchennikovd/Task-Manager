package com.taskmanager.backend.controller;

import com.taskmanager.backend.dto.AuthResponse;
import com.taskmanager.backend.dto.LoginRequest;
import com.taskmanager.backend.dto.SignupRequest;
import com.taskmanager.backend.entity.User;
import com.taskmanager.backend.security.JwtService;
import com.taskmanager.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        User user = authService.signup(request);
        String accessToken = jwtService.generateToken(user);

        return new AuthResponse(
                accessToken,
                userResponse(user)
        );
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        User user = authService.login(request);
        String accessToken = jwtService.generateToken(user);

        return new AuthResponse(
                accessToken,
                userResponse(user)
        );
    }

    @GetMapping("/me")
    public Map<String, Object> me(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid authorization header");
        }

        String token = authHeader.substring(7);

        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Invalid token");
        }

        String email = jwtService.extractEmail(token);
        User user = authService.getUserByEmail(email);

        return userResponse(user);
    }

    @PostMapping("/logout")
    public Map<String, Object> logout() {
        return Map.of(
                "message", "Logged out"
        );
    }

    private Map<String, Object> userResponse(User user) {
        return Map.of(
                "id", String.valueOf(user.getId()),
                "email", user.getEmail(),
                "name", user.getName() == null ? "" : user.getName()
        );
    }
}