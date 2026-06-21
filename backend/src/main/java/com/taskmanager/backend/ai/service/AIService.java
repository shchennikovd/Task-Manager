package com.taskmanager.backend.ai.service;

import com.taskmanager.backend.ai.dto.AIRequest;
import com.taskmanager.backend.ai.dto.AIResponse;
import com.taskmanager.backend.ai.dto.OpenRouterRequest;
import com.taskmanager.backend.ai.dto.OpenRouterResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;

@Service
public class AIService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    private final RestClient restClient = RestClient.create();

    public AIResponse suggestSubtasks(AIRequest request) {

        String prompt = """
                Ты помощник по управлению проектами.

                Разбей следующую задачу на 5-7 коротких подзадач.

                Верни ТОЛЬКО список.
                Каждая строка должна начинаться с "- ".

                Задача:
                %s
                """.formatted(request.getDescription());

        OpenRouterRequest body = new OpenRouterRequest(
                model,
                List.of(
                        new OpenRouterRequest.Message(
                                "user",
                                prompt
                        )
                )
        );

        OpenRouterResponse response =
                restClient.post()
                        .uri(apiUrl)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + apiKey)
                        .header("HTTP-Referer", "http://localhost:8080")
                        .header("X-Title", "Task Manager")
                        .body(body)
                        .retrieve()
                        .body(OpenRouterResponse.class);

        if (response == null
                || response.getChoices() == null
                || response.getChoices().isEmpty()) {

            return new AIResponse(List.of("ИИ не вернул ответ"));
        }

        String content = response.getChoices()
                .get(0)
                .getMessage()
                .getContent();

        List<String> suggestions = Arrays.stream(content.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(s -> s.replaceFirst("^-\\s*", ""))
                .toList();

        return new AIResponse(suggestions);
    }

}