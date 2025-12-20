package com.pianostudio.repository;

import com.pianostudio.model.Studio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudioRepository extends JpaRepository<Studio, Long> {
    Optional<Studio> findByInviteCode(String inviteCode);
    List<Studio> findByTeacherId(Long teacherId);
    boolean existsByInviteCode(String inviteCode);
}
