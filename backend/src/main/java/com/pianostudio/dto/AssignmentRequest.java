package com.pianostudio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Goal minutes is required")
    @Positive(message = "Goal minutes must be positive")
    private Integer goalMinutes;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Points value is required")
    @Positive(message = "Points value must be positive")
    private Integer pointsValue;

    private String attachments;  // URL or reference to attachment
}
