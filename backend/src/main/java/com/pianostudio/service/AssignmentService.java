package com.pianostudio.service;

import com.pianostudio.dto.AssignmentRequest;
import com.pianostudio.dto.AssignmentResponse;
import com.pianostudio.dto.StudentAssignmentResponse;
import com.pianostudio.exception.AssignmentNotFoundException;
import com.pianostudio.exception.StudioNotFoundException;
import com.pianostudio.exception.UnauthorizedAccessException;
import com.pianostudio.model.Assignment;
import com.pianostudio.model.Studio;
import com.pianostudio.model.StudentAssignment;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.User;
import com.pianostudio.repository.AssignmentRepository;
import com.pianostudio.repository.StudentAssignmentRepository;
import com.pianostudio.repository.StudentProfileRepository;
import com.pianostudio.repository.StudioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    private static final Logger logger = LoggerFactory.getLogger(AssignmentService.class);

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private StudentAssignmentRepository studentAssignmentRepository;

    @Autowired
    private StudioRepository studioRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    /**
     * Create assignment for a teacher - automatically uses the teacher's studio
     */
    @Transactional
    public AssignmentResponse createAssignmentForTeacher(AssignmentRequest request, User teacher) {
        logger.info("Creating assignment '{}' for teacher {}", request.getTitle(), teacher.getEmail());

        // Get the teacher's studio (first one if they have multiple)
        List<Studio> studios = studioRepository.findByTeacherId(teacher.getId());
        if (studios.isEmpty()) {
            throw new StudioNotFoundException("No studio found for teacher: " + teacher.getEmail());
        }
        Studio studio = studios.get(0);

        return createAssignment(studio.getId(), request, teacher);
    }

    @Transactional
    public AssignmentResponse createAssignment(Long studioId, AssignmentRequest request, User teacher) {
        logger.info("Creating assignment '{}' for studio {}", request.getTitle(), studioId);

        // Verify studio exists and teacher owns it
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new StudioNotFoundException("Studio not found with id: " + studioId));

        if (!studio.getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedAccessException("Only the studio teacher can create assignments");
        }

        // Create the assignment
        // Convert attachments string to list (if provided)
        List<String> attachmentsList = request.getAttachments() != null && !request.getAttachments().isBlank()
                ? List.of(request.getAttachments())
                : List.of();

        Assignment assignment = Assignment.builder()
                .studio(studio)
                .title(request.getTitle())
                .description(request.getDescription())
                .goalMinutes(request.getGoalMinutes())
                .dueDate(request.getDueDate())
                .attachments(attachmentsList)
                .pointsValue(request.getPointsValue())
                .build();

        assignment = assignmentRepository.save(assignment);

        // Create StudentAssignment records for all students in the studio
        List<StudentProfile> students = studentProfileRepository.findByStudioIdOrderByTotalPointsDesc(studioId);
        for (StudentProfile student : students) {
            StudentAssignment studentAssignment = StudentAssignment.builder()
                    .student(student.getUser())
                    .assignment(assignment)
                    .completed(false)
                    .progressMinutes(0)
                    .build();
            studentAssignmentRepository.save(studentAssignment);
        }

        logger.info("Assignment '{}' created with {} student assignments", assignment.getTitle(), students.size());

        return AssignmentResponse.fromEntity(assignment);
    }

    @Transactional
    public AssignmentResponse updateAssignment(Long assignmentId, AssignmentRequest request, User teacher) {
        logger.info("Updating assignment {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found with id: " + assignmentId));

        // Verify teacher owns the studio
        if (!assignment.getStudio().getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedAccessException("Only the studio teacher can update assignments");
        }

        // Update fields
        // Convert attachments string to list (if provided)
        List<String> attachmentsList = request.getAttachments() != null && !request.getAttachments().isBlank()
                ? List.of(request.getAttachments())
                : List.of();

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setGoalMinutes(request.getGoalMinutes());
        assignment.setDueDate(request.getDueDate());
        assignment.setAttachments(attachmentsList);
        assignment.setPointsValue(request.getPointsValue());

        assignment = assignmentRepository.save(assignment);

        logger.info("Assignment '{}' updated successfully", assignment.getTitle());

        return AssignmentResponse.fromEntity(assignment);
    }

    @Transactional
    public void deleteAssignment(Long assignmentId, User teacher) {
        logger.info("Deleting assignment {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found with id: " + assignmentId));

        // Verify teacher owns the studio
        if (!assignment.getStudio().getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedAccessException("Only the studio teacher can delete assignments");
        }

        assignmentRepository.delete(assignment);

        logger.info("Assignment '{}' deleted successfully", assignment.getTitle());
    }

    /**
     * Get assignments for a user - auto-detects studio if not provided
     */
    public List<AssignmentResponse> getAssignmentsForUser(Long studioId, User user) {
        // If studioId is not provided, auto-detect based on user role
        if (studioId == null) {
            if (user.getRole() == User.UserRole.TEACHER) {
                List<Studio> studios = studioRepository.findByTeacherId(user.getId());
                if (studios.isEmpty()) {
                    return List.of(); // Return empty list if teacher has no studio
                }
                studioId = studios.get(0).getId();
            } else if (user.getRole() == User.UserRole.STUDENT) {
                StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
                if (profile == null || profile.getStudio() == null) {
                    return List.of(); // Return empty list if student has no studio
                }
                studioId = profile.getStudio().getId();
            } else {
                return List.of(); // Parents or other roles without specific studio
            }
        }

        return getAssignmentsForStudio(studioId, user);
    }

    public List<AssignmentResponse> getAssignmentsForStudio(Long studioId, User user) {
        logger.info("Getting assignments for studio {}", studioId);

        // Verify user has access to this studio
        verifyStudioAccess(studioId, user);

        List<Assignment> assignments = assignmentRepository.findByStudioIdOrderByDueDateDesc(studioId);

        // If user is a student, include their progress
        if (user.getRole() == User.UserRole.STUDENT) {
            return assignments.stream()
                    .map(assignment -> {
                        StudentAssignment studentAssignment = studentAssignmentRepository
                                .findByStudentIdAndAssignmentId(user.getId(), assignment.getId())
                                .orElse(null);
                        return AssignmentResponse.fromEntity(assignment, studentAssignment);
                    })
                    .collect(Collectors.toList());
        }

        // For teachers, return assignments without student progress
        return assignments.stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public AssignmentResponse getAssignment(Long assignmentId, User user) {
        logger.info("Getting assignment {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found with id: " + assignmentId));

        // Verify user has access to this assignment's studio
        verifyStudioAccess(assignment.getStudio().getId(), user);

        // If user is a student, include their progress
        if (user.getRole() == User.UserRole.STUDENT) {
            StudentAssignment studentAssignment = studentAssignmentRepository
                    .findByStudentIdAndAssignmentId(user.getId(), assignmentId)
                    .orElse(null);
            return AssignmentResponse.fromEntity(assignment, studentAssignment);
        }

        return AssignmentResponse.fromEntity(assignment);
    }

    public List<StudentAssignmentResponse> getActiveAssignmentsForStudent(Long studentId) {
        logger.info("Getting active assignments for student {}", studentId);

        LocalDate today = LocalDate.now();
        List<StudentAssignment> studentAssignments = studentAssignmentRepository.findByStudentId(studentId);

        // Filter for active (not completed or upcoming) assignments
        return studentAssignments.stream()
                .filter(sa -> !sa.getCompleted() || sa.getAssignment().getDueDate().isAfter(today.minusDays(7)))
                .map(StudentAssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentAssignmentResponse updateStudentProgress(Long assignmentId, Integer progressMinutes, User student) {
        logger.info("Updating progress for student {} on assignment {}: {} minutes",
                student.getId(), assignmentId, progressMinutes);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found with id: " + assignmentId));

        // Get or create StudentAssignment record
        StudentAssignment studentAssignment = studentAssignmentRepository
                .findByStudentIdAndAssignmentId(student.getId(), assignmentId)
                .orElseGet(() -> {
                    // Create new StudentAssignment if it doesn't exist (e.g., student joined after assignment was created)
                    StudentAssignment newSA = StudentAssignment.builder()
                            .student(student)
                            .assignment(assignment)
                            .completed(false)
                            .progressMinutes(0)
                            .build();
                    return studentAssignmentRepository.save(newSA);
                });

        // Update progress
        studentAssignment.setProgressMinutes(progressMinutes);

        // Mark as completed if goal is reached
        if (progressMinutes >= assignment.getGoalMinutes() && !studentAssignment.getCompleted()) {
            studentAssignment.setCompleted(true);
            studentAssignment.setCompletedAt(LocalDateTime.now());

            // Award points to student
            StudentProfile studentProfile = studentProfileRepository.findByUserId(student.getId())
                    .orElse(null);
            if (studentProfile != null) {
                studentProfile.setTotalPoints(studentProfile.getTotalPoints() + assignment.getPointsValue());
                studentProfileRepository.save(studentProfile);
                logger.info("Awarded {} points to student {}", assignment.getPointsValue(), student.getName());
            }
        }

        studentAssignment = studentAssignmentRepository.save(studentAssignment);

        logger.info("Progress updated successfully for student {} on assignment '{}'",
                student.getName(), assignment.getTitle());

        return StudentAssignmentResponse.fromEntity(studentAssignment);
    }

    /**
     * Verify that a user has access to a studio (either as teacher or student)
     */
    private void verifyStudioAccess(Long studioId, User user) {
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new StudioNotFoundException("Studio not found with id: " + studioId));

        boolean hasAccess = false;

        if (user.getRole() == User.UserRole.TEACHER) {
            hasAccess = studio.getTeacher().getId().equals(user.getId());
        } else if (user.getRole() == User.UserRole.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
            hasAccess = profile != null && profile.getStudio().getId().equals(studioId);
        }

        if (!hasAccess) {
            throw new UnauthorizedAccessException("You do not have access to this studio");
        }
    }
}
