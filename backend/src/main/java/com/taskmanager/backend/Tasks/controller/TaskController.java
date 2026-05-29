package com.taskmanager.backend.Tasks.controller;

import com.taskmanager.backend.Tasks.dto.CreateTaskRequest;
import com.taskmanager.backend.Tasks.dto.TaskResponse;
import com.taskmanager.backend.Tasks.dto.UpdateTaskRequest;
import com.taskmanager.backend.Tasks.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // CREATE
    @PostMapping
    public TaskResponse createTask(@RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    // GET ALL
    @GetMapping
    public List<TaskResponse> getAllTasks() {
        return taskService.getAllTasks();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public TaskResponse getTaskById(@PathVariable UUID id) {
        return taskService.getTaskById(id);
    }

    // UPDATE (PATCH)
    @PatchMapping("/{id}")
    public TaskResponse updateTask(@PathVariable UUID id,
                                   @RequestBody UpdateTaskRequest request) {
        return taskService.updateTask(id, request);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
    }
}