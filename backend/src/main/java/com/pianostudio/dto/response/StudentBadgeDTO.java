package com.pianostudio.dto.response;

import com.pianostudio.model.StudentBadge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentBadgeDTO {
    private Long id;
    private BadgeDTO badge;
    private LocalDateTime earnedAt;

    public static StudentBadgeDTO fromEntity(StudentBadge studentBadge) {
        return StudentBadgeDTO.builder()
                .id(studentBadge.getId())
                .badge(BadgeDTO.fromEntity(studentBadge.getBadge()))
                .earnedAt(studentBadge.getEarnedAt())
                .build();
    }
}
