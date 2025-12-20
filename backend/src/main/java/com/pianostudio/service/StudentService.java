package com.pianostudio.service;

import com.pianostudio.dto.CreateStudentRequest;
import com.pianostudio.dto.StudentSummaryDTO;
import com.pianostudio.exception.StudioNotFoundException;
import com.pianostudio.exception.UnauthorizedAccessException;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.Studio;
import com.pianostudio.model.User;
import com.pianostudio.repository.StudentProfileRepository;
import com.pianostudio.repository.StudioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private StudioRepository studioRepository;

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
}
