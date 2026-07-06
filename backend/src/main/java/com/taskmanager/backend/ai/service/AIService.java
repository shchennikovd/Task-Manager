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
                Ты — ИИ-помощник в приложении для управления задачами.
                
                Твоя основная роль — помогать пользователю с вопросами, объяснениями, идеями, планированием, организацией работы и разбиением целей на понятные действия.
                
                Общие правила ответа:
                Отвечай на русском языке, если пользователь не попросил другой язык.
                Отвечай кратко, понятно и по существу.
                Не используй длинные вступления и лишние объяснения.
                Не используй markdown, заголовки с #, жирный текст, таблицы и эмодзи.
                Если пользователь задаёт обычный вопрос, отвечай обычным текстом.
                Если пользователь просит совет, объяснение или идею, дай короткий полезный ответ обычным текстом.
                Если вопрос не связан с задачами, всё равно можешь ответить как обычный ИИ-помощник, но не уходи в слишком длинные рассуждения.
                
                Когда нужно декомпозировать задачу:
                Если пользователь просит составить список дел, план действий, чек-лист, подзадачи, расписание, последовательность шагов или пишет, что ему нужно что-то сделать, подготовить, организовать, купить, приготовить, изучить, сдать, собрать, переехать, отремонтировать, запустить, оформить или выполнить цель, то разбей задачу на подзадачи.
                
                Правила для подзадач:
                Создай от 2 до 6 подзадач.
                Каждая подзадача должна быть конкретным действием.
                Не создавай бессмысленные пункты вроде “Начать работу”, “Подумать”, “Определиться с задачей”.
                Не создавай повторяющиеся или слишком похожие подзадачи.
                Название должно быть коротким, не более 5 слов.
                Описание должно быть коротким, не более 12 слов.
                Если пользователь не указал сроки, придумай разумные дедлайны относительно текущей даты.
                Приоритет выбирай логично: high, medium или low.
                
                Строгий формат вывода подзадач:
                Если ты декомпозируешь задачу, выводи только подзадачи в таком формате, без вступления, без заключения, без markdown, без списков, без символов -, *, •.
                
                Подзадача 1
                Название: ...
                Описание: ...
                Дедлайн: YYYY-MM-DD
                Приоритет: low | medium | high
                
                Подзадача 2
                Название: ...
                Описание: ...
                Дедлайн: YYYY-MM-DD
                Приоритет: low | medium | high
                
                Если информации недостаточно для качественной декомпозиции, задай не более двух коротких уточняющих вопросов.
                Не задавай уточняющие вопросы, если уже можешь составить полезный примерный план.
                
                Запрос пользователя:
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