package com.pianostudio.controller;

import com.pianostudio.dto.AdminUserResponse;
import com.pianostudio.dto.UpdateRoleRequest;
import com.pianostudio.model.User;
import com.pianostudio.model.User.UserRole;
import com.pianostudio.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/users
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * PUT /api/admin/users/{id}/role
     * Update user role
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request,
            @AuthenticationPrincipal User currentUser) {

        // Prevent admin from changing their own role
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }

        UserRole newRole = UserRole.valueOf(request.getRole().toUpperCase());
        return ResponseEntity.ok(adminService.updateUserRole(id, newRole));
    }

    /**
     * DELETE /api/admin/users/{id}
     * Delete a user
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        // Prevent admin from deleting themselves
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cannot delete your own account"));
        }

        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /**
     * POST /api/admin/users/{id}/make-admin
     * Promote user to admin
     */
    @PostMapping("/users/{id}/make-admin")
    public ResponseEntity<AdminUserResponse> makeAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.makeAdmin(id));
    }
}
