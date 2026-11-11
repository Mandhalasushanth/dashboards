package com.taxedge.dashboards.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.auth.dto.AgentLoginDto;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.helper.AgentLoginHelper;
import com.taxedge.dashboards.auth.mapper.AgentLoginMapper;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of AgentLoginService for creating agent accounts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentLoginServiceImpl implements AgentLoginService {

    private final AgentLoginRepository agentLoginRepository;
    private final AgentLoginMapper agentLoginMapper;
    private final PasswordEncoder passwordEncoder;
    private final AgentLoginHelper agentLoginHelper;

    @Override
    @Transactional
    public AgentLoginDto createAgent(AgentLoginDto agentLoginDto) {
        String email = agentLoginHelper.normalizeEmail(agentLoginDto.getEmail());
        log.info("Creating agent account for: {}", email);

        agentLoginHelper.ensureEmailIsFree(email, null);
        agentLoginHelper.ensurePasswordGiven(agentLoginDto.getPassword());

        AgentLogin agent = agentLoginMapper.toEntity(agentLoginDto);
        agent.setEmail(email);
        agent.setManager(agentLoginHelper.findManagerFor(agentLoginDto.getManagerId(), agentLoginDto.getRole()));
        agent.setPassword(passwordEncoder.encode(agentLoginDto.getPassword()));

        return agentLoginMapper.toDto(agentLoginRepository.save(agent));
    }
}
