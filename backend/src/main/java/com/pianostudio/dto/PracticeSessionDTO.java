package com.pianostudio.dto;

import com.pianostudio.model.PracticeSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeSessionDTO {

    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer minutes;
    private Integer pointsEarned;
    private String assignmentTitle;

    public static PracticeSessionDTO fromEntity(PracticeSession session) {
        return PracticeSessionDTO.builder()
                .id(session.getId())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .minutes(session.getMinutes())
                .pointsEarned(session.getPointsEarned())
                .assignmentTitle(session.getAssignment() != null ? session.getAssignment().getTitle() : null)
                .build();
    }
}
