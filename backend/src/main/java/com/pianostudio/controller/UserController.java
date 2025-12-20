package com.pianostudio.controller;

import com.pianostudio.dto.UserDTO;
import com.pianostudio.model.User;
import com.pianostudio.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal User user) {
        logger.info("Getting profile for user: {}", user.getEmail());
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        logger.info("Getting user with id: {}", id);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * Delete current user's account (COPPA compliance)
     * DELETE /api/users/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal User user) {
        logger.info("Account deletion requested by user: {}", user.getEmail());
        try {
            userService.deleteAccount(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Your account has been successfully deleted"
            ));
        } catch (IllegalStateException e) {
            logger.warn("Account deletion blocked for user: {} - {}", user.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
