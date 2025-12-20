package com.pianostudio.dto;

import com.pianostudio.model.AccountStatus;
import com.pianostudio.model.ConsentRequestStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConsentStatusResponse {
    private AccountStatus accountStatus;
    private ConsentRequestStatus consentRequestStatus;
    private boolean hasActiveConsent;
    private String parentEmail;
    private String message;
}
