package com.pianostudio.controller;

import com.pianostudio.dto.AssignmentRequest;
import com.pianostudio.dto.AssignmentResponse;
import com.pianostudio.dto.StudentAssignmentResponse;
import com.pianostudio.dto.UpdateProgressRequest;
import com.pianostudio.model.User;
import com.pianostudio.service.AssignmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private static final Logger logger = LoggerFactory.getLogger(AssignmentController.class);

    @Autowired
    private AssignmentService assignmentService;

    /**
     * Create a new assignment (teachers only)
     * Uses the teacher's studio automatically
     */
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AssignmentRequest request) {

        logger.info("Teacher {} creating assignment '{}'", user.getEmail(), request.getTitle());

        AssignmentResponse response = assignmentService.createAssignmentForTeacher(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all assignments for a studio
     * Teachers see all assignments, students see assignments with their progress
     * studioId is optional - if not provided, uses the teacher's studio
     */
    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getAssignments(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long studioId) {

        logger.info("User {} getting assignments for studio {}", user.getEmail(), studioId);

        List<AssignmentResponse> assignments = assignmentService.getAssignmentsForUser(studioId, user);
        return ResponseEntity.ok(assignments);
    }

    /**
     * Get a single assignment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        logger.info("User {} getting assignment {}", user.getEmail(), id);

        AssignmentResponse assignment = assignmentService.getAssignment(id, user);
        return ResponseEntity.ok(assignment);
    }

    /**
     * Get active assignments for the authenticated student
     */
    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentAssignmentResponse>> getMyAssignments(
            @AuthenticationPrincipal User user) {

        logger.info("Student {} getting their active assignments", user.getEmail());

        List<StudentAssignmentResponse> assignments = assignmentService.getActiveAssignmentsForStudent(user.getId());
        return ResponseEntity.ok(assignments);
    }

    /**
     * Update an assignment (teachers only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AssignmentRequest request) {

        logger.info("Teacher {} updating assignment {}", user.getEmail(), id);

        AssignmentResponse response = assignmentService.updateAssignment(id, request, user);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an assignment (teachers only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        logger.info("Teacher {} deleting assignment {}", user.getEmail(), id);

        assignmentService.deleteAssignment(id, user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update student progress on an assignment
     * Students can update their own progress
     */
    @PutMapping("/{id}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentAssignmentResponse> updateProgress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgressRequest request) {

        logger.info("Student {} updating progress on assignment {}: {} minutes",
                user.getEmail(), id, request.getProgressMinutes());

        StudentAssignmentResponse response = assignmentService.updateStudentProgress(
                id, request.getProgressMinutes(), user);
        return ResponseEntity.ok(response);
    }
}
