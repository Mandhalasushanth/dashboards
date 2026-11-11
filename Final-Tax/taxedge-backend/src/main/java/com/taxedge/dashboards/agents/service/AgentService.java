package com.taxedge.dashboards.agents.service;

import java.util.List;

import com.taxedge.dashboards.auth.dto.AgentLoginDto;
import com.taxedge.dashboards.auth.enums.AgentRole;

public interface AgentService {

    List<AgentLoginDto> getAgents(AgentRole role);

    List<AgentLoginDto> getAgentsByManager(Long managerId);

    AgentLoginDto getAgentById(Long id);

    AgentLoginDto updateAgent(Long id, AgentLoginDto agentLoginDto);

    void deleteAgent(Long id);
}

