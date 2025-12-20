package com.pianostudio.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProgressRequest {

    @NotNull(message = "Progress minutes is required")
    @PositiveOrZero(message = "Progress minutes must be zero or positive")
    private Integer progressMinutes;
}
