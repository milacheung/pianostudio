package com.pianostudio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionRequest {

    @NotBlank(message = "Emoji is required")
    @Pattern(
        regexp = "^[\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u{1F1E0}-\\u{1F1FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}\\u{1F900}-\\u{1F9FF}\\u{1F7E0}-\\u{1F7FF}]+$",
        message = "Invalid emoji format"
    )
    private String emoji;
}
