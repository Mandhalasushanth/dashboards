package com.taxedge.dashboards.agents.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.agents.service.AgentService;
import com.taxedge.dashboards.auth.dto.AgentLoginDto;
import com.taxedge.dashboards.auth.enums.AgentRole;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

    
    @GetMapping("/admin/agents")
    public ResponseEntity<List<AgentLoginDto>> getAgents(
            @RequestParam(required = false) AgentRole role,
            @RequestParam(required = false) Long managerId) {
        log.info("Received request for agents with role: {} and managerId: {}", role, managerId);
        return ResponseEntity.ok(managerId != null
                ? agentService.getAgentsByManager(managerId)
                : agentService.getAgents(role));
    }

    @GetMapping("/admin/agents/{id}")
    public ResponseEntity<AgentLoginDto> getAgentById(@PathVariable Long id) {
        log.info("Received request for agent with id: {}", id);
        return ResponseEntity.ok(agentService.getAgentById(id));
    }

    @PutMapping("/admin/agents/{id}")
    public ResponseEntity<AgentLoginDto> updateAgent(
            @PathVariable Long id,
            @RequestBody AgentLoginDto agentLoginDto) {
        log.info("Received request to update agent with id: {}", id);
        return ResponseEntity.ok(agentService.updateAgent(id, agentLoginDto));
    }

    @DeleteMapping("/admin/agents/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        log.info("Received request to delete agent with id: {}", id);
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }
}

