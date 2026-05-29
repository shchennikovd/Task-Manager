package com.taskmanager.backend.repository;

import com.taskmanager.backend.entity.Project;
import com.taskmanager.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findAllByOwner(User owner);

    Optional<Project> findByIdAndOwner(Long id, User owner);
}
