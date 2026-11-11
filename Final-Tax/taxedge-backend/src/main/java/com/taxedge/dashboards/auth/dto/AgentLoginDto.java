package com.taxedge.dashboards.auth.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.taxedge.dashboards.auth.enums.AgentRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for the "New agent" screen and the AgentLogin entity.
 * Passwords are accepted on input only and are never written back in a response.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentLoginDto {

    private Long id;

    private String fullName;

    private String email;

    private AgentRole role;

    /** "Reports to": the id of the agent's manager. */
    private Long managerId;

    /** The manager's full name; filled in by the server on responses. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String managerName;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    /** Only compared with password on the form; never stored. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String confirmPassword;

    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
