package com.taskmanager.backend.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.backend.ai.client.OpenRouterClient;
import com.taskmanager.backend.ai.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIService {

    private final OpenRouterClient client;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIService(OpenRouterClient client) {
        this.client = client;
    }

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    public AIResponse suggestSubtasks(AIRequest request) {

        String prompt = """
Ты помощник по управлению проектами.

Разбей задачу на 3–6 подзадач.

Верни ТОЛЬКО JSON массив. Не добавляй никаких объяснений, только JSON. Не используй markdown. Не оборачивай в '''\s:

[
  {
    "title": "Название задачи",
    "description": "Описание",
    "date": "2026-06-21",
    "priority": "low",
    "status": "pending",
    "color": "#ffffff"
  }
]

Задача:
%s
""".formatted(request.getDescription());

        OpenRouterRequest body = new OpenRouterRequest(
                model,
                List.of(new OpenRouterRequest.Message("user", prompt))
        );

        OpenRouterResponse response =
                client.call(apiUrl, apiKey, body);

        if (response == null || response.getChoices().isEmpty()) {
            return new AIResponse(List.of());
        }

        String content = response.getChoices().get(0).getMessage().getContent();

        try {
            List<AITaskDto> tasks = objectMapper.readValue(
                    content,
                    new TypeReference<List<AITaskDto>>() {}
            );

            return new AIResponse(tasks);

        } catch (Exception e) {
            throw new RuntimeException("Invalid AI JSON:\n" + content);
        }
    }
}