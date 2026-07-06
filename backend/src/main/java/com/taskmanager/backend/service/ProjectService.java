package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.CreateProjectRequest;
import com.taskmanager.backend.dto.UpdateProjectRequest;
import com.taskmanager.backend.entity.Project;
import com.taskmanager.backend.entity.User;
import com.taskmanager.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Project createProject(CreateProjectRequest request, User owner) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwner(owner);

        return projectRepository.save(project);
    }

    public List<Project> getProjects(User owner) {
        return projectRepository.findAllByOwner(owner);
    }

    public Project getProjectById(Long id, User owner) {
        return projectRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public Project updateProject(Long id, UpdateProjectRequest request, User owner) {
        Project project = getProjectById(id, owner);

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName());
        }

        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        return projectRepository.save(project);
    }

    public void deleteProject(Long id, User owner) {
        Project project = getProjectById(id, owner);
        projectRepository.delete(project);
    }
}