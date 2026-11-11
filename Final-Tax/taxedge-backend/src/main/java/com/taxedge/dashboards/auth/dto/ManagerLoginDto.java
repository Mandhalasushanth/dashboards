package com.taxedge.dashboards.auth.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.taxedge.dashboards.auth.enums.ManagerRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for the "New manager" screen and the ManagerLogin entity.
 * Passwords are accepted on input only and are never written back in a response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagerLoginDto {

    private Long id;

    private String fullName;

    private String email;

    private ManagerRole role;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    /** Only compared with password on the form; never stored. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String confirmPassword;

    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
