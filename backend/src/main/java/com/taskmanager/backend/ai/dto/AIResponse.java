package com.taskmanager.backend.ai.dto;

import java.util.List;

public class AIResponse {

    private List<AITaskDto> tasks;

    public AIResponse() {}

    public AIResponse(List<AITaskDto> tasks) {
        this.tasks = tasks;
    }

    public List<AITaskDto> getTasks() {
        return tasks;
    }

    public void setTasks(List<AITaskDto> tasks) {
        this.tasks = tasks;
    }
}