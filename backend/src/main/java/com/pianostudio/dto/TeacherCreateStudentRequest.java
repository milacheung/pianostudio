package com.pianostudio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for teachers creating students in their studio.
 * Allows optional parent email for sending invites.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherCreateStudentRequest {

    @NotBlank(message = "Student name is required")
    private String name;

    private Integer age;

    private String grade;

    @Email(message = "Invalid email format")
    private String parentEmail;  // Optional - for sending invite

    private Boolean sendInvite;  // Whether to send invite email now
}
