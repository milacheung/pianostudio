package com.pianostudio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MagicLinkLoginResponse {
    private boolean success;
    private String token;
    private Long userId;
    private String email;
    private String name;
    private String role;
    private boolean newUser;
    private Long studentId;
    private String studentName;
}
