package com.pianostudio.repository;

import com.pianostudio.model.StudentPiece;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentPieceRepository extends JpaRepository<StudentPiece, Long> {
    List<StudentPiece> findByStudentId(Long studentId);
    List<StudentPiece> findByStudentIdAndStatus(Long studentId, String status);
    List<StudentPiece> findByStudentIdOrderByStartedAtDesc(Long studentId);
}
