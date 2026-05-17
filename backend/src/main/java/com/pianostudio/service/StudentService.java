package com.pianostudio.service;

import com.pianostudio.dto.CreateStudentRequest;
import com.pianostudio.dto.StudentSummaryDTO;
import com.pianostudio.dto.TeacherCreateStudentRequest;
import com.pianostudio.exception.StudioNotFoundException;
import com.pianostudio.exception.UnauthorizedAccessException;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.Studio;
import com.pianostudio.model.User;
import com.pianostudio.model.User.UserRole;
import com.pianostudio.repository.StudentProfileRepository;
import com.pianostudio.repository.StudioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private StudioRepository studioRepository;

    @Autowired
    private MagicLinkService magicLinkService;

    /**
     * Create a student profile for a parent's child
     */
    @Transactional
    public StudentSummaryDTO createStudent(CreateStudentRequest request, User parent) {
        logger.info("Creating student '{}' for parent {}", request.getName(), parent.getEmail());

        // Find the studio the parent belongs to
        List<StudentProfile> parentStudents = studentProfileRepository.findByParentId(parent.getId());
        Studio studio;

        if (!parentStudents.isEmpty()) {
            // Parent already has children - use same studio
            studio = parentStudents.get(0).getStudio();
        } else {
            // This is an error - parent should have joined a studio first
            throw new StudioNotFoundException("Parent must join a studio before adding students");
        }

        // Create student profile
        StudentProfile studentProfile = StudentProfile.builder()
                .name(request.getName())
                .age(request.getAge())
                .grade(request.getGrade())
                .studio(studio)
                .parent(parent)
                .totalPoints(0)
                .currentStreak(0)
                .longestStreak(0)
                .build();

        studentProfile = studentProfileRepository.save(studentProfile);

        logger.info("Created student profile {} for '{}' in studio '{}'",
                studentProfile.getId(), request.getName(), studio.getName());

        return StudentSummaryDTO.fromEntity(studentProfile);
    }

    /**
     * Create the first student for a parent during onboarding (with studio)
     */
    @Transactional
    public StudentSummaryDTO createStudentForStudio(CreateStudentRequest request, Studio studio, User parent) {
        logger.info("Creating student '{}' for parent {} in studio {}",
                request.getName(), parent.getEmail(), studio.getName());

        StudentProfile studentProfile = StudentProfile.builder()
                .name(request.getName())
                .age(request.getAge())
                .grade(request.getGrade())
                .studio(studio)
                .parent(parent)
                .totalPoints(0)
                .currentStreak(0)
                .longestStreak(0)
                .build();

        studentProfile = studentProfileRepository.save(studentProfile);

        logger.info("Created student profile {} for '{}' in studio '{}'",
                studentProfile.getId(), request.getName(), studio.getName());

        return StudentSummaryDTO.fromEntity(studentProfile);
    }

    /**
     * Get all students for a parent
     */
    public List<StudentSummaryDTO> getStudentsForParent(User parent) {
        logger.info("Getting students for parent {}", parent.getEmail());

        List<StudentProfile> students = studentProfileRepository.findByParentId(parent.getId());

        return students.stream()
                .map(StudentSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific student by ID (verify parent ownership)
     */
    public StudentSummaryDTO getStudent(Long studentId, User parent) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new StudioNotFoundException("Student not found with id: " + studentId));

        // Verify parent owns this student
        if (student.getParent() == null || !student.getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedAccessException("You don't have access to this student");
        }

        return StudentSummaryDTO.fromEntity(student);
    }

    /**
     * Update a student profile
     */
    @Transactional
    public StudentSummaryDTO updateStudent(Long studentId, CreateStudentRequest request, User parent) {
        logger.info("Updating student {} for parent {}", studentId, parent.getEmail());

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new StudioNotFoundException("Student not found with id: " + studentId));

        // Verify parent owns this student
        if (student.getParent() == null || !student.getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedAccessException("You don't have access to this student");
        }

        // Update fields
        student.setName(request.getName());
        student.setAge(request.getAge());
        student.setGrade(request.getGrade());

        student = studentProfileRepository.save(student);

        logger.info("Updated student profile {} for '{}'", student.getId(), request.getName());

        return StudentSummaryDTO.fromEntity(student);
    }

    /**
     * Delete a student profile
     */
    @Transactional
    public void deleteStudent(Long studentId, User parent) {
        logger.info("Deleting student {} for parent {}", studentId, parent.getEmail());

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new StudioNotFoundException("Student not found with id: " + studentId));

        // Verify parent owns this student
        if (student.getParent() == null || !student.getParent().getId().equals(parent.getId())) {
            throw new UnauthorizedAccessException("You don't have access to this student");
        }

        studentProfileRepository.delete(student);

        logger.info("Deleted student profile {}", studentId);
    }

    // ==================== Teacher Methods ====================

    /**
     * Create a student in the teacher's studio (teacher-initiated onboarding)
     */
    @Transactional
    public StudentSummaryDTO createStudentAsTeacher(TeacherCreateStudentRequest request, User teacher) {
        logger.info("Teacher {} creating student '{}'", teacher.getEmail(), request.getName());

        // Verify user is a teacher
        if (teacher.getRole() != UserRole.TEACHER && teacher.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only teachers can create students directly");
        }

        // Find the teacher's studio
        List<Studio> studios = studioRepository.findByTeacherId(teacher.getId());
        if (studios.isEmpty()) {
            throw new StudioNotFoundException("Teacher does not have a studio");
        }
        Studio studio = studios.get(0);  // Use first studio if teacher has multiple

        // Create student profile (no parent linked yet)
        StudentProfile studentProfile = StudentProfile.builder()
                .name(request.getName())
                .age(request.getAge())
                .grade(request.getGrade())
                .studio(studio)
                .parent(null)  // No parent yet - will be claimed later
                .parentEmail(request.getParentEmail())
                .parentInviteStatus(request.getParentEmail() != null ? "pending" : "none")
                .totalPoints(0)
                .currentStreak(0)
                .longestStreak(0)
                .build();

        // If sendInvite is true and we have an email, mark as invited and send magic link
        if (Boolean.TRUE.equals(request.getSendInvite()) && request.getParentEmail() != null) {
            studentProfile.setParentInviteStatus("invited");
            studentProfile.setParentInvitedAt(LocalDateTime.now());
        }

        studentProfile = studentProfileRepository.save(studentProfile);

        // Send magic link invite after saving (we need the student ID)
        if (Boolean.TRUE.equals(request.getSendInvite()) && request.getParentEmail() != null) {
            magicLinkService.sendMagicLink(request.getParentEmail(), studentProfile.getId());
            logger.info("Sent magic link invite to {} for student {}",
                    request.getParentEmail(), request.getName());
        }

        logger.info("Teacher created student profile {} for '{}' in studio '{}'",
                studentProfile.getId(), request.getName(), studio.getName());

        return StudentSummaryDTO.fromEntity(studentProfile);
    }

    /**
     * Get all students in the teacher's studio
     */
    public List<StudentSummaryDTO> getStudentsForTeacher(User teacher) {
        logger.info("Getting students for teacher {}", teacher.getEmail());

        // Verify user is a teacher
        if (teacher.getRole() != UserRole.TEACHER && teacher.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only teachers can view studio students");
        }

        // Find the teacher's studio
        List<Studio> studios = studioRepository.findByTeacherId(teacher.getId());
        if (studios.isEmpty()) {
            throw new StudioNotFoundException("Teacher does not have a studio");
        }
        Studio studio = studios.get(0);

        List<StudentProfile> students = studentProfileRepository.findByStudioId(studio.getId());

        return students.stream()
                .map(StudentSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update a student as teacher
     */
    @Transactional
    public StudentSummaryDTO updateStudentAsTeacher(Long studentId, TeacherCreateStudentRequest request, User teacher) {
        logger.info("Teacher {} updating student {}", teacher.getEmail(), studentId);

        // Verify user is a teacher
        if (teacher.getRole() != UserRole.TEACHER && teacher.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only teachers can update students directly");
        }

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new StudioNotFoundException("Student not found with id: " + studentId));

        // Verify teacher owns the studio this student belongs to
        List<Studio> studios = studioRepository.findByTeacherId(teacher.getId());
        if (studios.isEmpty()) {
            throw new StudioNotFoundException("Teacher does not have a studio");
        }
        Studio studio = studios.get(0);

        if (!student.getStudio().getId().equals(studio.getId())) {
            throw new UnauthorizedAccessException("Student does not belong to your studio");
        }

        // Update fields
        student.setName(request.getName());
        student.setAge(request.getAge());
        student.setGrade(request.getGrade());

        // Update parent email if provided
        if (request.getParentEmail() != null) {
            student.setParentEmail(request.getParentEmail());
            // If status was 'none', set to 'pending'
            if ("none".equals(student.getParentInviteStatus())) {
                student.setParentInviteStatus("pending");
            }
        }

        // Send invite if requested
        if (Boolean.TRUE.equals(request.getSendInvite()) && request.getParentEmail() != null) {
            student.setParentInviteStatus("invited");
            student.setParentInvitedAt(LocalDateTime.now());
        }

        student = studentProfileRepository.save(student);

        // Send magic link invite if requested
        if (Boolean.TRUE.equals(request.getSendInvite()) && request.getParentEmail() != null) {
            magicLinkService.sendMagicLink(request.getParentEmail(), student.getId());
            logger.info("Sent magic link invite to {} for student {}",
                    request.getParentEmail(), request.getName());
        }

        logger.info("Teacher updated student profile {} for '{}'", student.getId(), request.getName());

        return StudentSummaryDTO.fromEntity(student);
    }

    /**
     * Delete a student as teacher
     */
    @Transactional
    public void deleteStudentAsTeacher(Long studentId, User teacher) {
        logger.info("Teacher {} deleting student {}", teacher.getEmail(), studentId);

        // Verify user is a teacher
        if (teacher.getRole() != UserRole.TEACHER && teacher.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Only teachers can delete students directly");
        }

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new StudioNotFoundException("Student not found with id: " + studentId));

        // Verify teacher owns the studio this student belongs to
        List<Studio> studios = studioRepository.findByTeacherId(teacher.getId());
        if (studios.isEmpty()) {
            throw new StudioNotFoundException("Teacher does not have a studio");
        }
        Studio studio = studios.get(0);

        if (!student.getStudio().getId().equals(studio.getId())) {
            throw new UnauthorizedAccessException("Student does not belong to your studio");
        }

        studentProfileRepository.delete(student);

        logger.info("Teacher deleted student profile {}", studentId);
    }
}
