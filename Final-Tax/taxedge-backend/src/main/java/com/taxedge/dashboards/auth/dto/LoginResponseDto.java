package com.taxedge.dashboards.auth.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The signed-in user, whichever account table they came from. role is ADMIN, CA_MANAGER,
 * LOAN_MANAGER, CA_AGENT or LOAN_AGENT, and the frontend opens that role's workspace.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {

    private Long id;

    private String email;

    private String username;

    private String fullName;

    private String role;

    private Long managerId;

    private String accessToken;

    private String refreshToken;

    private LocalDateTime lastLoginAt;

    private LocalDateTime updatedAt;
}
