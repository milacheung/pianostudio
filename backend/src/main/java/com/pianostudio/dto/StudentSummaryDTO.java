package com.pianostudio.dto;

import com.pianostudio.model.StudentProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSummaryDTO {
    private Long id;
    private Long userId;  // null for parent-created students
    private String name;
    private String avatarUrl;
    private Integer age;
    private String grade;
    private Integer totalPoints;
    private Integer currentStreak;

    public static StudentSummaryDTO fromEntity(StudentProfile studentProfile) {
        StudentSummaryDTOBuilder builder = StudentSummaryDTO.builder()
                .id(studentProfile.getId())
                .name(studentProfile.getDisplayName())
                .age(studentProfile.getAge())
                .grade(studentProfile.getGrade())
                .totalPoints(studentProfile.getTotalPoints())
                .currentStreak(studentProfile.getCurrentStreak());

        // Handle legacy students with user accounts
        if (studentProfile.getUser() != null) {
            builder.userId(studentProfile.getUser().getId())
                   .avatarUrl(studentProfile.getUser().getAvatarUrl());
        }

        return builder.build();
    }
}
