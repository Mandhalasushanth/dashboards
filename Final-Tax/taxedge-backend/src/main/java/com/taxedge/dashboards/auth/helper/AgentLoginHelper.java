package com.taxedge.dashboards.auth.helper;

import org.springframework.stereotype.Component;

import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.entity.ManagerLogin;
import com.taxedge.dashboards.auth.enums.AgentRole;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;
import com.taxedge.exception.DuplicateResourceException;
import com.taxedge.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Shared lookups and checks for agent accounts, used by AgentLoginServiceImpl.
 * Email rules are the same as for managers, so they come from ManagerLoginHelper.
 */
@Component
@RequiredArgsConstructor
public class AgentLoginHelper {

    private final AgentLoginRepository agentLoginRepository;
    private final ManagerLoginHelper managerLoginHelper;

    public AgentLogin findAgent(Long id) {
        return agentLoginRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + id));
    }

    public String normalizeEmail(String email) {
        return managerLoginHelper.normalizeEmail(email);
    }

    /** Rejects an email another agent or any manager already uses; pass the agent's own id when editing. */
    public void ensureEmailIsFree(String email, Long currentId) {
        agentLoginRepository.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("An account with this email already exists");
                });
        managerLoginHelper.ensureEmailIsFree(email, null);
    }

    /** The agent's manager, who must exist and lead the same team as the agent's role. */
    public ManagerLogin findManagerFor(Long managerId, AgentRole role) {
        if (managerId == null) {
            throw new IllegalArgumentException("Choose the manager this agent reports to");
        }
        if (role == null) {
            throw new IllegalArgumentException("Role is required");
        }
        ManagerLogin manager = managerLoginHelper.findManager(managerId);
        if (manager.getRole() != role.getManagerRole()) {
            throw new IllegalArgumentException("A " + label(role) + " must report to a " + label(role.getManagerRole()));
        }
        return manager;
    }

    public void ensurePasswordGiven(String password) {
        managerLoginHelper.ensurePasswordGiven(password);
    }

    private String label(Enum<?> role) {
        String[] words = role.name().toLowerCase().split("_");
        return (words[0].equals("ca") ? "CA" : "Loan") + " " + words[1];
    }
}
