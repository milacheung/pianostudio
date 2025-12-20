package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(name = "icon_url", nullable = false)
    private String iconUrl;

    @Column(nullable = false)
    private String criteria;

    @OneToMany(mappedBy = "badge", cascade = CascadeType.ALL)
    @Builder.Default
    private List<StudentBadge> studentBadges = new ArrayList<>();
}
