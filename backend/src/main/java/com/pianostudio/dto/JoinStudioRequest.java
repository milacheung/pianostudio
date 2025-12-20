package com.pianostudio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JoinStudioRequest {
    @NotBlank(message = "Invite code is required")
    @Size(min = 6, max = 6, message = "Invite code must be 6 characters")
    private String inviteCode;
}
