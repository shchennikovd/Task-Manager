package com.taskmanager.backend.Tasks.service;

import com.taskmanager.backend.Tasks.dto.CreateTaskRequest;
import com.taskmanager.backend.Tasks.dto.TaskResponse;
import com.taskmanager.backend.Tasks.dto.UpdateTaskRequest;
import com.taskmanager.backend.Tasks.entity.Task;
import com.taskmanager.backend.Tasks.enums.Priority;
import com.taskmanager.backend.Tasks.enums.Status;
import com.taskmanager.backend.Tasks.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // CREATE
    public TaskResponse createTask(CreateTaskRequest request) {

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDate(request.getDate());
        task.setColor(request.getColor());

        if (request.getPriority() != null) {
            task.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));
        }

        if (request.getStatus() != null) {
            task.setStatus(Status.valueOf(request.getStatus().toUpperCase()));
        }

        Task saved = taskRepository.save(task);

        return mapToResponse(saved);
    }

    // GET ALL
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY ID
    public TaskResponse getTaskById(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return mapToResponse(task);
    }

    // UPDATE (PATCH)
    public TaskResponse updateTask(UUID id, UpdateTaskRequest request) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDate() != null) task.setDate(request.getDate());
        if (request.getColor() != null) task.setColor(request.getColor());

        if (request.getPriority() != null) {
            task.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));
        }

        if (request.getStatus() != null) {
            task.setStatus(Status.valueOf(request.getStatus().toUpperCase()));
        }

        return mapToResponse(taskRepository.save(task));
    }

    // DELETE
    public void deleteTask(UUID id) {
        taskRepository.deleteById(id);
    }

    // MAPPER (чтобы не дублировать код)
    private TaskResponse mapToResponse(Task task) {
        TaskResponse response = new TaskResponse();

        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setDate(task.getDate());
        response.setColor(task.getColor());

        response.setPriority(task.getPriority() != null ? task.getPriority().name() : null);
        response.setStatus(task.getStatus() != null ? task.getStatus().name() : null);

        return response;
    }
}
