package com.pianostudio.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LinkParentRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;
}
