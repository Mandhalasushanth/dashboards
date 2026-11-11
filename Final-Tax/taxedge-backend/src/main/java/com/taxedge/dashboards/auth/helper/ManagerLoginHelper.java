package com.taxedge.dashboards.auth.helper;

import java.util.Locale;

import org.springframework.stereotype.Component;

import com.taxedge.dashboards.auth.entity.ManagerLogin;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;
import com.taxedge.dashboards.auth.repository.ManagerLoginRepository;
import com.taxedge.exception.DuplicateResourceException;
import com.taxedge.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Shared lookups and checks for manager accounts, used by ManagerLoginServiceImpl.
 */
@Component
@RequiredArgsConstructor
public class ManagerLoginHelper {

    private final ManagerLoginRepository managerLoginRepository;
    private final AgentLoginRepository agentLoginRepository;

    public ManagerLogin findManager(Long id) {
        return managerLoginRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + id));
    }

    /** Rejects an email another account already uses; pass the manager's own id when editing. */
    public void ensureEmailIsFree(String email, Long currentId) {
        managerLoginRepository.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("An account with this email already exists");
                });
    }

    /** Managers and agents sign in on the same page, so a manager cannot reuse an agent's email. */
    public void ensureNotAgentEmail(String email) {
        agentLoginRepository.findByEmailIgnoreCase(email).ifPresent(existing -> {
            throw new DuplicateResourceException("An account with this email already exists");
        });
    }

    /** A manager who still has agents cannot be deleted; their agents must move to another manager first. */
    public void ensureHasNoAgents(Long managerId) {
        if (agentLoginRepository.existsByManagerId(managerId)) {
            throw new DuplicateResourceException("This manager still has agents. Move them to another manager before deleting.");
        }
    }

    public void ensurePasswordGiven(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
    }

    public String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Work email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
