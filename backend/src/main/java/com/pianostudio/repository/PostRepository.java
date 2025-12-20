package com.pianostudio.repository;

import com.pianostudio.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByStudioIdOrderByCreatedAtDesc(Long studioId);
    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    Page<Post> findByStudioIdOrderByCreatedAtDesc(Long studioId, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.studio.id = :studioId")
    Long countByStudioId(@Param("studioId") Long studioId);

    void deleteByAuthorId(Long authorId);
}
