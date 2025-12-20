package com.pianostudio.repository;

import com.pianostudio.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId OR m.recipient.id = :userId) ORDER BY m.createdAt DESC")
    List<Message> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :user1Id AND m.recipient.id = :user2Id) OR (m.sender.id = :user2Id AND m.recipient.id = :user1Id) ORDER BY m.createdAt ASC")
    List<Message> findConversation(Long user1Id, Long user2Id);

    long countByRecipientIdAndReadAtIsNull(Long recipientId);

    @Modifying
    @Query("DELETE FROM Message m WHERE m.sender.id = :userId OR m.recipient.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
