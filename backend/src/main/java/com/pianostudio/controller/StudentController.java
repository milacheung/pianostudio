package com.pianostudio.controller;

import com.pianostudio.dto.CreateStudentRequest;
import com.pianostudio.dto.StudentSummaryDTO;
import com.pianostudio.model.User;
import com.pianostudio.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    /**
     * Get all students for the current parent
     */
    @GetMapping("/my")
    public ResponseEntity<List<StudentSummaryDTO>> getMyStudents(@AuthenticationPrincipal User parent) {
        List<StudentSummaryDTO> students = studentService.getStudentsForParent(parent);
        return ResponseEntity.ok(students);
    }

    /**
     * Create a new student profile (for parent's child)
     */
    @PostMapping
    public ResponseEntity<StudentSummaryDTO> createStudent(
            @Valid @RequestBody CreateStudentRequest request,
            @AuthenticationPrincipal User parent) {
        StudentSummaryDTO student = studentService.createStudent(request, parent);
        return ResponseEntity.ok(student);
    }

    /**
     * Get a specific student by ID
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<StudentSummaryDTO> getStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal User parent) {
        StudentSummaryDTO student = studentService.getStudent(studentId, parent);
        return ResponseEntity.ok(student);
    }

    /**
     * Update a student profile
     */
    @PutMapping("/{studentId}")
    public ResponseEntity<StudentSummaryDTO> updateStudent(
            @PathVariable Long studentId,
            @Valid @RequestBody CreateStudentRequest request,
            @AuthenticationPrincipal User parent) {
        StudentSummaryDTO student = studentService.updateStudent(studentId, request, parent);
        return ResponseEntity.ok(student);
    }

    /**
     * Delete a student profile
     */
    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> deleteStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal User parent) {
        studentService.deleteStudent(studentId, parent);
        return ResponseEntity.noContent().build();
    }
}
