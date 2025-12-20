package com.pianostudio.dto;

import com.pianostudio.model.StudentAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssignmentResponse {

    // Assignment details
    private Long assignmentId;
    private String title;
    private String description;
    private Integer goalMinutes;
    private LocalDate dueDate;
    private List<String> attachments;
    private Integer pointsValue;

    // Student progress
    private Long studentAssignmentId;
    private Boolean completed;
    private Integer progressMinutes;
    private LocalDateTime completedAt;

    // Calculated fields
    private Integer progressPercentage;
    private Boolean isOverdue;

    public static StudentAssignmentResponse fromEntity(StudentAssignment studentAssignment) {
        LocalDate today = LocalDate.now();
        boolean isOverdue = !studentAssignment.getCompleted()
                && studentAssignment.getAssignment().getDueDate().isBefore(today);

        int progressPercentage = 0;
        if (studentAssignment.getAssignment().getGoalMinutes() > 0) {
            progressPercentage = Math.min(100,
                    (studentAssignment.getProgressMinutes() * 100) / studentAssignment.getAssignment().getGoalMinutes());
        }

        return StudentAssignmentResponse.builder()
                .assignmentId(studentAssignment.getAssignment().getId())
                .title(studentAssignment.getAssignment().getTitle())
                .description(studentAssignment.getAssignment().getDescription())
                .goalMinutes(studentAssignment.getAssignment().getGoalMinutes())
                .dueDate(studentAssignment.getAssignment().getDueDate())
                .attachments(studentAssignment.getAssignment().getAttachments())
                .pointsValue(studentAssignment.getAssignment().getPointsValue())
                .studentAssignmentId(studentAssignment.getId())
                .completed(studentAssignment.getCompleted())
                .progressMinutes(studentAssignment.getProgressMinutes())
                .completedAt(studentAssignment.getCompletedAt())
                .progressPercentage(progressPercentage)
                .isOverdue(isOverdue)
                .build();
    }
}
