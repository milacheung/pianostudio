package com.pianostudio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteSignupResponse {
    private UserDTO user;
    private StudioDTO studio;
    private Boolean needsStudentCreation; // true for PARENT - frontend shows "add children" form
}
