package com.taxedge.dashboards.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.auth.dto.ManagerLoginDto;
import com.taxedge.dashboards.auth.entity.ManagerLogin;
import com.taxedge.dashboards.auth.helper.ManagerLoginHelper;
import com.taxedge.dashboards.auth.mapper.ManagerLoginMapper;
import com.taxedge.dashboards.auth.repository.ManagerLoginRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of ManagerLoginService for creating manager accounts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ManagerLoginServiceImpl implements ManagerLoginService {

    private final ManagerLoginRepository managerLoginRepository;
    private final ManagerLoginMapper managerLoginMapper;
    private final PasswordEncoder passwordEncoder;
    private final ManagerLoginHelper managerLoginHelper;

    @Override
    @Transactional
    public ManagerLoginDto createManager(ManagerLoginDto managerLoginDto) {
        String email = managerLoginHelper.normalizeEmail(managerLoginDto.getEmail());
        log.info("Creating manager account for: {}", email);

        managerLoginHelper.ensureEmailIsFree(email, null);
        managerLoginHelper.ensureNotAgentEmail(email);
        managerLoginHelper.ensurePasswordGiven(managerLoginDto.getPassword());

        ManagerLogin manager = managerLoginMapper.toEntity(managerLoginDto);
        manager.setEmail(email);
        manager.setPassword(passwordEncoder.encode(managerLoginDto.getPassword()));

        return managerLoginMapper.toDto(managerLoginRepository.save(manager));
    }
}
