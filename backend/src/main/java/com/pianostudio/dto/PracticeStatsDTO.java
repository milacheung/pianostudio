package com.pianostudio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PracticeStatsDTO {

    private Integer totalMinutesToday;
    private Integer totalMinutesWeek;
    private Integer totalMinutesMonth;
    private Integer currentStreak;
    private Integer totalPoints;
}
