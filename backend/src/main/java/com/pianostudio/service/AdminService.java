package com.pianostudio.service;

import com.pianostudio.dto.AdminUserResponse;
import com.pianostudio.model.User;
import com.pianostudio.model.User.UserRole;
import com.pianostudio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse updateUserRole(Long userId, UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setRole(newRole);
        User savedUser = userRepository.save(user);
        return toAdminUserResponse(savedUser);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Prevent deleting self (admin users)
        userRepository.delete(user);
    }

    @Transactional
    public AdminUserResponse makeAdmin(Long userId) {
        return updateUserRole(userId, UserRole.ADMIN);
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .firstName(user.getFirstName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
