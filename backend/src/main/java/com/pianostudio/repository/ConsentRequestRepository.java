package com.pianostudio.repository;

import com.pianostudio.model.ConsentRequest;
import com.pianostudio.model.ConsentRequestStatus;
import com.pianostudio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsentRequestRepository extends JpaRepository<ConsentRequest, Long> {
    Optional<ConsentRequest> findByToken(String token);
    List<ConsentRequest> findByChildUser(User childUser);
    List<ConsentRequest> findByChildUserAndStatus(User childUser, ConsentRequestStatus status);
    List<ConsentRequest> findByParentEmail(String parentEmail);
    Optional<ConsentRequest> findByChildUserAndStatusAndParentEmail(User childUser, ConsentRequestStatus status, String parentEmail);
    boolean existsByChildUserAndStatus(User childUser, ConsentRequestStatus status);
    void deleteByChildUserId(Long childUserId);
}
