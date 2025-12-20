package com.pianostudio.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AgeVerificationRequest {
    @NotNull(message = "Birth date is required")
    private LocalDate birthDate;
}
