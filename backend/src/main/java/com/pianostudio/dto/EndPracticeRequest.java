package com.pianostudio.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndPracticeRequest {

    @NotNull(message = "Minutes is required")
    @Min(value = 1, message = "Minutes must be at least 1")
    private Integer minutes;
}
