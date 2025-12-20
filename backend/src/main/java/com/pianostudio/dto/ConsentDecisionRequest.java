package com.pianostudio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConsentDecisionRequest {
    @NotBlank(message = "Token is required")
    private String token;

    @NotNull(message = "Approved decision is required")
    private Boolean approved;

    private String parentSignature;
}
