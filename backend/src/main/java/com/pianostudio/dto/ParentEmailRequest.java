package com.pianostudio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParentEmailRequest {
    @NotBlank(message = "Parent email is required")
    @Email(message = "Invalid email format")
    private String parentEmail;
}
