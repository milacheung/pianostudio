package com.pianostudio.repository;

import com.pianostudio.model.StudentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAssignmentRepository extends JpaRepository<StudentAssignment, Long> {
    List<StudentAssignment> findByStudentId(Long studentId);
    List<StudentAssignment> findByAssignmentId(Long assignmentId);
    Optional<StudentAssignment> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
    void deleteByStudentId(Long studentId);

    // Count completed assignments for a student
    long countByStudentIdAndCompletedTrue(Long studentId);
}
