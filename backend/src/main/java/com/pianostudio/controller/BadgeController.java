package com.pianostudio.controller;

import com.pianostudio.dto.response.BadgeDTO;
import com.pianostudio.dto.response.StudentBadgeDTO;
import com.pianostudio.model.User;
import com.pianostudio.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    /**
     * Get all available badges.
     */
    @GetMapping
    public ResponseEntity<List<BadgeDTO>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    /**
     * Get badges earned by the current user.
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<List<StudentBadgeDTO>> getMyBadges(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(badgeService.getStudentBadges(user.getId()));
    }

    /**
     * Get badges earned by a specific student.
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'PARENT', 'ADMIN')")
    public ResponseEntity<List<StudentBadgeDTO>> getStudentBadges(@PathVariable Long studentId) {
        return ResponseEntity.ok(badgeService.getStudentBadges(studentId));
    }

    /**
     * Get count of badges earned by the current user.
     */
    @GetMapping("/me/count")
    @PreAuthorize("hasAnyRole('STUDENT', 'PARENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<Integer> getMyBadgeCount(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(badgeService.getBadgeCount(user.getId()));
    }

    /**
     * Manually check and award badges for the current user.
     * Usually called automatically after practice, but can be triggered manually.
     */
    @PostMapping("/check")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<BadgeDTO>> checkAndAwardBadges(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(badgeService.checkAndAwardBadges(user.getId()));
    }
}
