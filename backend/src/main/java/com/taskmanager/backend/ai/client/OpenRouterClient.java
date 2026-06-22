package com.taskmanager.backend.ai.client;

import com.taskmanager.backend.ai.dto.OpenRouterRequest;
import com.taskmanager.backend.ai.dto.OpenRouterResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OpenRouterClient {

    private final RestClient restClient = RestClient.create();

    public OpenRouterResponse call(String url, String apiKey, OpenRouterRequest body) {

        return restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost:8080")
                .header("X-Title", "Task Manager")
                .body(body)
                .retrieve()
                .body(OpenRouterResponse.class);
    }
}