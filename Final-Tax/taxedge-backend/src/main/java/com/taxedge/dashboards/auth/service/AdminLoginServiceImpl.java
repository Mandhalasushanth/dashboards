package com.taxedge.dashboards.auth.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.auth.dto.AdminLoginDto;
import com.taxedge.dashboards.auth.entity.AdminLogin;
import com.taxedge.dashboards.auth.mapper.AdminLoginMapper;
import com.taxedge.dashboards.auth.repository.AdminLoginRepository;
import com.taxedge.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of AdminLoginService for administrator authentication
 * and profile management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminLoginServiceImpl implements AdminLoginService {

    private final AdminLoginRepository adminLoginRepository;
    private final AdminLoginMapper adminLoginMapper;
    private final PasswordEncoder passwordEncoder;


    @Override
    @Transactional(readOnly = true)
    public AdminLoginDto getAdminByEmail(String email) {
        AdminLogin admin = adminLoginRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with email: " + email));
        return adminLoginMapper.toDto(admin);
    }

    @Override
    @Transactional
    public AdminLoginDto updateAdmin(Long id, AdminLoginDto adminLoginDto) {
        AdminLogin admin = adminLoginRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + id));

        adminLoginMapper.updateEntityFromDto(adminLoginDto, admin);

        if (adminLoginDto.getPassword() != null && !adminLoginDto.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(adminLoginDto.getPassword()));
        }

        admin.setUpdatedAt(LocalDateTime.now());
        AdminLogin updatedAdmin = adminLoginRepository.save(admin);
        return adminLoginMapper.toDto(updatedAdmin);
    }
}