package com.taskmanager.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class OpenRouterRequest {

    private String model;
    private List<Message> messages;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class Message {

        private String role;
        private String content;

    }
}