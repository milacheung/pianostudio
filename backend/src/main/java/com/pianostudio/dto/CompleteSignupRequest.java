package com.pianostudio.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompleteSignupRequest {
    // firstName is optional - already captured from Google OAuth
    private String firstName;

    @NotNull(message = "Role is required")
    private String role;

    private String inviteCode;
    private String studioName;
}
