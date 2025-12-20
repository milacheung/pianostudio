package com.pianostudio.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConsentFormDataResponse {
    private String childFirstName;
    private String parentEmail;
    private boolean valid;
    private boolean expired;
    private String message;
}
