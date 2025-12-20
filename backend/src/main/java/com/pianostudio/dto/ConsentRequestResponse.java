package com.pianostudio.dto;

import com.pianostudio.model.ConsentRequest;
import com.pianostudio.model.ConsentRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConsentRequestResponse {
    private Long id;
    private String parentEmail;
    private ConsentRequestStatus status;
    private LocalDateTime tokenExpiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private boolean expired;

    public static ConsentRequestResponse fromEntity(ConsentRequest entity) {
        return ConsentRequestResponse.builder()
                .id(entity.getId())
                .parentEmail(entity.getParentEmail())
                .status(entity.getStatus())
                .tokenExpiresAt(entity.getTokenExpiresAt())
                .createdAt(entity.getCreatedAt())
                .respondedAt(entity.getRespondedAt())
                .expired(entity.isExpired())
                .build();
    }
}
