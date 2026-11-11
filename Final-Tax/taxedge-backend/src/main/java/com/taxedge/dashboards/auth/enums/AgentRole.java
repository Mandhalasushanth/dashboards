package com.taxedge.dashboards.auth.enums;

/**
 * Roles an administrator can give an agent account on the "New agent" screen.
 * Each agent reports to a manager of the same team: CA agents to a CA manager,
 * loan agents to a loan manager.
 */
public enum AgentRole {
    CA_AGENT(ManagerRole.CA_MANAGER),
    LOAN_AGENT(ManagerRole.LOAN_MANAGER);

    private final ManagerRole managerRole;

    AgentRole(ManagerRole managerRole) {
        this.managerRole = managerRole;
    }

    /** The manager role this agent must report to. */
    public ManagerRole getManagerRole() {
        return managerRole;
    }
}
