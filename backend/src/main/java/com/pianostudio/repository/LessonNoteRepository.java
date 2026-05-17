package com.pianostudio.repository;

import com.pianostudio.model.LessonNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonNoteRepository extends JpaRepository<LessonNote, Long> {
    List<LessonNote> findByStudentIdOrderByLessonDateDesc(Long studentId);
    List<LessonNote> findByStudentIdAndPieceIdOrderByLessonDateDesc(Long studentId, Long pieceId);
    List<LessonNote> findByTeacherIdOrderByLessonDateDesc(Long teacherId);
}
