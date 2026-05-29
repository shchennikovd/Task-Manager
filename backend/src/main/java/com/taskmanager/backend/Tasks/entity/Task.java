package com.taskmanager.backend.Tasks.entity;

import com.taskmanager.backend.Tasks.enums.Priority;
import com.taskmanager.backend.Tasks.enums.Status;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue
    private UUID id;

    private String title;

    private String description;

    private String date;

    private String color;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Status status;

    // ID
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    // TITLE
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // DESCRIPTION
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // DATE
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    // COLOR
    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    // PRIORITY
    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    // STATUS
    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
