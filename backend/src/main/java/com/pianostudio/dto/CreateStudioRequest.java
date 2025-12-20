package com.pianostudio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateStudioRequest {
    @NotBlank(message = "Studio name is required")
    private String name;
}
