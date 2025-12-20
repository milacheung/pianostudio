package com.pianostudio.repository;

import com.pianostudio.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    List<Reaction> findByPostId(Long postId);

    Optional<Reaction> findByPostIdAndUserIdAndEmoji(Long postId, Long userId, String emoji);

    Optional<Reaction> findByPostIdAndUserId(Long postId, Long userId);

    @Modifying
    @Query("DELETE FROM Reaction r WHERE r.post.id = :postId AND r.user.id = :userId")
    void deleteByPostIdAndUserId(@Param("postId") Long postId, @Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Reaction r WHERE r.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Reaction r WHERE r.post.author.id = :authorId")
    void deleteByPostAuthorId(@Param("authorId") Long authorId);
}
