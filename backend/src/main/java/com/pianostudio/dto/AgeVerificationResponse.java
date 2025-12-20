package com.pianostudio.dto;

import com.pianostudio.model.AgeRange;
import com.pianostudio.model.AgeVerification;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgeVerificationResponse {
    private Long id;
    private AgeRange ageRange;
    private Boolean isMinor;
    private Boolean requiresConsent;
    private String verificationMethod;

    public static AgeVerificationResponse fromEntity(AgeVerification entity) {
        return AgeVerificationResponse.builder()
                .id(entity.getId())
                .ageRange(entity.getAgeRange())
                .isMinor(entity.getIsMinor())
                .requiresConsent(entity.getRequiresConsent())
                .verificationMethod(entity.getVerificationMethod())
                .build();
    }
}
