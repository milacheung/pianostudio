package com.pianostudio.dto;

import com.pianostudio.model.Assignment;
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
public class AssignmentResponse {

    private Long id;
    private Long studioId;
    private String studioName;
    private String title;
    private String description;
    private Integer goalMinutes;
    private LocalDate dueDate;
    private String attachments;  // Return as String for frontend compatibility
    private Integer pointsValue;
    private LocalDateTime createdAt;

    // Student-specific fields (populated when viewing as student)
    private Boolean completed;
    private Integer progressMinutes;
    private LocalDateTime completedAt;

    public static AssignmentResponse fromEntity(Assignment assignment) {
        return fromEntity(assignment, null);
    }

    public static AssignmentResponse fromEntity(Assignment assignment, StudentAssignment studentAssignment) {
        // Convert List<String> attachments to String (join with comma if multiple)
        String attachmentsString = null;
        List<String> attachmentsList = assignment.getAttachments();
        if (attachmentsList != null && !attachmentsList.isEmpty()) {
            attachmentsString = String.join(",", attachmentsList);
        }

        AssignmentResponseBuilder builder = AssignmentResponse.builder()
                .id(assignment.getId())
                .studioId(assignment.getStudio().getId())
                .studioName(assignment.getStudio().getName())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .goalMinutes(assignment.getGoalMinutes())
                .dueDate(assignment.getDueDate())
                .attachments(attachmentsString)
                .pointsValue(assignment.getPointsValue())
                .createdAt(assignment.getCreatedAt());

        // Add student progress if available
        if (studentAssignment != null) {
            builder.completed(studentAssignment.getCompleted())
                   .progressMinutes(studentAssignment.getProgressMinutes())
                   .completedAt(studentAssignment.getCompletedAt());
        }

        return builder.build();
    }
}
