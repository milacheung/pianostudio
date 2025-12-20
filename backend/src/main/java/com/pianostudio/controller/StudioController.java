package com.pianostudio.controller;

import com.pianostudio.dto.CreateStudioRequest;
import com.pianostudio.dto.JoinStudioRequest;
import com.pianostudio.dto.StudentSummaryDTO;
import com.pianostudio.dto.StudioDTO;
import com.pianostudio.model.Studio;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.User;
import com.pianostudio.service.StudioService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/studios")
public class StudioController {

    private static final Logger logger = LoggerFactory.getLogger(StudioController.class);

    @Autowired
    private StudioService studioService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<StudioDTO> createStudio(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateStudioRequest request) {

        logger.info("Creating studio: {} for teacher: {}", request.getName(), user.getEmail());

        Studio studio = studioService.createStudio(request.getName(), user);
        return ResponseEntity.ok(StudioDTO.fromEntity(studio));
    }

    @PostMapping("/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudioDTO> joinStudio(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody JoinStudioRequest request) {

        logger.info("Student {} joining studio with code: {}", user.getEmail(), request.getInviteCode());

        Studio studio = studioService.joinStudio(request.getInviteCode(), user);
        return ResponseEntity.ok(StudioDTO.fromEntity(studio));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudioDTO> getStudio(@PathVariable Long id) {
        logger.info("Getting studio with id: {}", id);

        Studio studio = studioService.getStudioById(id);
        return ResponseEntity.ok(StudioDTO.fromEntity(studio));
    }

    @GetMapping("/my-studios")
    public ResponseEntity<List<StudioDTO>> getMyStudios(@AuthenticationPrincipal User user) {
        logger.info("Getting studios for user: {}", user.getEmail());

        List<Studio> studios;

        if (user.getRole() == User.UserRole.TEACHER) {
            studios = studioService.getStudiosForTeacher(user.getId());
        } else if (user.getRole() == User.UserRole.STUDENT) {
            Studio studio = studioService.getStudioForStudent(user.getId());
            studios = List.of(studio);
        } else {
            studios = List.of();
        }

        List<StudioDTO> studioDTOs = studios.stream()
                .map(StudioDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(studioDTOs);
    }

    @GetMapping("/code/{inviteCode}")
    public ResponseEntity<StudioDTO> getStudioByInviteCode(@PathVariable String inviteCode) {
        logger.info("Getting studio with invite code: {}", inviteCode);

        Studio studio = studioService.getStudioByInviteCode(inviteCode);
        return ResponseEntity.ok(StudioDTO.fromEntity(studio));
    }

    /**
     * Get all students in a studio by invite code
     * Used by parents during onboarding to select their child
     */
    @GetMapping("/{inviteCode}/students")
    public ResponseEntity<List<StudentSummaryDTO>> getStudentsByInviteCode(@PathVariable String inviteCode) {
        logger.info("Getting students for studio with invite code: {}", inviteCode);

        List<StudentProfile> students = studioService.getStudentsByInviteCode(inviteCode);
        List<StudentSummaryDTO> studentDTOs = students.stream()
                .map(StudentSummaryDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(studentDTOs);
    }

    /**
     * Get the user's studio (teacher's created studio or student/parent's joined studio)
     */
    @GetMapping("/mine")
    public ResponseEntity<StudioDTO> getMyStudio(@AuthenticationPrincipal User user) {
        logger.info("Getting studio for user: {}", user.getEmail());

        Studio studio = studioService.getStudioForUser(user);

        if (studio == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(StudioDTO.fromEntity(studio));
    }
}
