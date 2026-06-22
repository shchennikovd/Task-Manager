package com.taskmanager.backend.ai.controller;

import com.taskmanager.backend.ai.dto.AIRequest;
import com.taskmanager.backend.ai.dto.AIResponse;
import com.taskmanager.backend.ai.service.AIService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/suggest")
    public AIResponse suggest(@RequestBody AIRequest request) {
        return aiService.suggestSubtasks(request);
    }
}