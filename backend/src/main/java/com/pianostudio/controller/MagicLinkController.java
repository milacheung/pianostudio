package com.pianostudio.controller;

import com.pianostudio.dto.MagicLinkLoginResponse;
import com.pianostudio.dto.SendMagicLinkRequest;
import com.pianostudio.model.MagicLink;
import com.pianostudio.model.User;
import com.pianostudio.service.MagicLinkService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/magic-link")
public class MagicLinkController {

    private static final Logger logger = LoggerFactory.getLogger(MagicLinkController.class);

    @Autowired
    private MagicLinkService magicLinkService;

    /**
     * Send a magic link to a parent (called by teacher)
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMagicLink(
            @Valid @RequestBody SendMagicLinkRequest request,
            @AuthenticationPrincipal User teacher) {

        logger.info("Teacher {} sending magic link to {} for student {}",
                teacher.getEmail(), request.getEmail(), request.getStudentId());

        try {
            MagicLink magicLink = magicLinkService.sendMagicLink(request.getEmail(), request.getStudentId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Magic link sent to " + request.getEmail(),
                    "expiresAt", magicLink.getExpiresAt().toString()
            ));
        } catch (Exception e) {
            logger.error("Failed to send magic link: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Validate a magic link and return JWT (public endpoint)
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateMagicLink(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Token is required"
            ));
        }

        logger.info("Validating magic link token");

        try {
            MagicLinkService.MagicLinkResult result = magicLinkService.validateAndLogin(token);

            return ResponseEntity.ok(new MagicLinkLoginResponse(
                    true,
                    result.jwt(),
                    result.user().getId(),
                    result.user().getEmail(),
                    result.user().getName(),
                    result.user().getRole().name(),
                    result.isNewUser(),
                    result.student().getId(),
                    result.student().getDisplayName()
            ));
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid magic link: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Check if a magic link token is valid (without consuming it)
     */
    @GetMapping("/check/{token}")
    public ResponseEntity<?> checkMagicLink(@PathVariable String token) {
        logger.info("Checking magic link token validity");

        MagicLinkService.MagicLinkCheckResult result = magicLinkService.checkToken(token);

        return ResponseEntity.ok(Map.of(
                "valid", result.valid(),
                "email", result.email() != null ? result.email() : "",
                "studentName", result.studentName() != null ? result.studentName() : "",
                "expired", result.expired(),
                "used", result.used(),
                "message", result.message()
        ));
    }
}
