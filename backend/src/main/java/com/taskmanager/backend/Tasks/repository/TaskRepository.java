package com.taskmanager.backend.Tasks.repository;

import com.taskmanager.backend.Tasks.entity.Task;
import com.taskmanager.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByUser(User user);

}