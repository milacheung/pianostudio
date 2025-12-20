package com.pianostudio.controller;

import com.pianostudio.dto.*;
import com.pianostudio.model.Studio;
import com.pianostudio.model.User;
import com.pianostudio.security.JwtTokenProvider;
import com.pianostudio.service.StudioService;
import com.pianostudio.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private StudioService studioService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal User user) {
        logger.info("Getting current user: {}", user.getEmail());
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @PostMapping("/complete-signup")
    public ResponseEntity<CompleteSignupResponse> completeSignup(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CompleteSignupRequest request) {

        logger.info("Completing signup for user: {} with role: {}", user.getEmail(), request.getRole());

        // If user already has a role, return current state (idempotent)
        if (user.getRole() != null) {
            logger.info("User {} already has role: {}, returning current state", user.getEmail(), user.getRole());
            Studio existingStudio = studioService.getStudioForUser(user);
            return ResponseEntity.ok(CompleteSignupResponse.builder()
                    .user(UserDTO.fromEntity(user))
                    .studio(existingStudio != null ? StudioDTO.fromEntity(existingStudio) : null)
                    .build());
        }

        // Update firstName only if provided (otherwise keep OAuth-provided name)
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }

        Studio studio = null;
        Boolean needsStudentCreation = null;

        // Handle role-specific onboarding
        String roleUpper = request.getRole().toUpperCase();
        switch (roleUpper) {
            case "TEACHER":
                if (request.getStudioName() == null || request.getStudioName().isBlank()) {
                    throw new IllegalArgumentException("Studio name is required for teachers");
                }
                studio = userService.completeTeacherOnboarding(user, request.getStudioName());
                logger.info("Created new studio: {} for teacher: {}", studio.getName(), user.getEmail());
                break;

            case "PARENT":
                if (request.getInviteCode() == null || request.getInviteCode().isBlank()) {
                    throw new IllegalArgumentException("Invite code is required for parents");
                }
                studio = userService.completeParentOnboarding(user, request.getInviteCode());
                needsStudentCreation = true; // Parent must add child profiles
                logger.info("Parent {} joined studio: {}, needs to add students", user.getEmail(), studio.getName());
                break;

            default:
                throw new IllegalArgumentException("Invalid role: " + request.getRole() + ". Must be TEACHER or PARENT");
        }

        CompleteSignupResponse response = CompleteSignupResponse.builder()
                .user(UserDTO.fromEntity(user, studio))
                .studio(studio != null ? StudioDTO.fromEntity(studio) : null)
                .needsStudentCreation(needsStudentCreation)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/link-parent")
    public ResponseEntity<UserDTO> linkParent(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody LinkParentRequest request) {

        logger.info("Linking parent {} to student ID: {}", user.getEmail(), request.getStudentId());

        userService.linkParentToStudent(user, request.getStudentId());

        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
