package com.pianostudio.repository;

import com.pianostudio.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByStudioIdOrderByDueDateDesc(Long studioId);
    List<Assignment> findByStudioIdAndDueDateGreaterThanEqual(Long studioId, LocalDate date);
}
