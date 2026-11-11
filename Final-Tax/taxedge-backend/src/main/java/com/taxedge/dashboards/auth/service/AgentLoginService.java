package com.taxedge.dashboards.auth.service;

import com.taxedge.dashboards.auth.dto.AgentLoginDto;

/**
 * Service interface for agent accounts: creating agent accounts.
 * Management methods (listing, updating, deleting) are moved to AgentService.
 */
public interface AgentLoginService {

    AgentLoginDto createAgent(AgentLoginDto agentLoginDto);
}
