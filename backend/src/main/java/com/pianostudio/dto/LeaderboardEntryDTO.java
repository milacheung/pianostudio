package com.pianostudio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private Integer rank;
    private Long studentId;
    private String studentName;
    private String avatarUrl;
    private Integer totalPoints;
    private Integer currentStreak;
    private Integer weeklyMinutes;
}
