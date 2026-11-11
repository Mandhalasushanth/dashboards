package com.taxedge.dashboards.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.auth.dto.AgentLoginDto;
import com.taxedge.dashboards.auth.service.AgentLoginService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for agent account creation: the administrator creates them under
 * /api/v1/admin/agents. Management operations are moved to AgentController.
 * Sign-in is LoginController (/api/v1/auth/login).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AgentLoginController {

    private final AgentLoginService agentLoginService;

    @PostMapping("/admin/agents")
    public ResponseEntity<AgentLoginDto> createAgent(@RequestBody AgentLoginDto agentLoginDto) {
        log.info("Received request to create agent: {}", agentLoginDto.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(agentLoginService.createAgent(agentLoginDto));
    }
}
