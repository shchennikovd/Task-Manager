package com.taskmanager.backend.controller;

import com.taskmanager.backend.dto.CreateProjectRequest;
import com.taskmanager.backend.dto.UpdateProjectRequest;
import com.taskmanager.backend.entity.Project;
import com.taskmanager.backend.entity.User;
import com.taskmanager.backend.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public Map<String, Object> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal User user
    ) {
        Project project = projectService.createProject(request, user);
        return toResponse(project);
    }

    @GetMapping
    public List<Map<String, Object>> getProjects(@AuthenticationPrincipal User user) {
        return projectService.getProjects(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Project project = projectService.getProjectById(id, user);
        return toResponse(project);
    }

    @PatchMapping("/{id}")
    public Map<String, Object> updateProject(
            @PathVariable Long id,
            @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal User user
    ) {
        Project project = projectService.updateProject(id, request, user);
        return toResponse(project);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        projectService.deleteProject(id, user);

        return Map.of(
                "message", "Project deleted"
        );
    }

    private Map<String, Object> toResponse(Project project) {
        return Map.of(
                "id", project.getId(),
                "name", project.getName(),
                "description", project.getDescription() == null ? "" : project.getDescription(),
                "createdAt", project.getCreatedAt()
        );
    }
}
