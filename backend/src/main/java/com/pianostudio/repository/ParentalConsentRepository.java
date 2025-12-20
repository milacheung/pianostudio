package com.pianostudio.repository;

import com.pianostudio.model.ConsentType;
import com.pianostudio.model.ParentalConsent;
import com.pianostudio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentalConsentRepository extends JpaRepository<ParentalConsent, Long> {
    List<ParentalConsent> findByChildUser(User childUser);
    List<ParentalConsent> findByParentUser(User parentUser);
    Optional<ParentalConsent> findByChildUserAndConsentType(User childUser, ConsentType consentType);

    @Query("SELECT pc FROM ParentalConsent pc WHERE pc.childUser = :childUser AND pc.consentGiven = true AND pc.revokedDate IS NULL")
    List<ParentalConsent> findActiveConsentsByChildUser(@Param("childUser") User childUser);

    @Query("SELECT pc FROM ParentalConsent pc WHERE pc.childUser.id = :childUserId AND pc.consentType = :consentType AND pc.consentGiven = true AND pc.revokedDate IS NULL")
    Optional<ParentalConsent> findActiveConsentByChildUserIdAndType(@Param("childUserId") Long childUserId, @Param("consentType") ConsentType consentType);

    boolean existsByChildUserAndConsentTypeAndConsentGivenTrueAndRevokedDateIsNull(User childUser, ConsentType consentType);

    void deleteByChildUserId(Long childUserId);
}
