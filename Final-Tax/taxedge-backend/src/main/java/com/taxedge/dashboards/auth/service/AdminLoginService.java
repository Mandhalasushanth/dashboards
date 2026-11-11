package com.taxedge.dashboards.auth.service;

import com.taxedge.dashboards.auth.dto.AdminLoginDto;

/**
 * Service interface for Admin Login operations, authentication,
 * and account profile management in the Admin Dashboard.
 */
public interface AdminLoginService {

    AdminLoginDto getAdminByEmail(String email);

    AdminLoginDto updateAdmin(Long id, AdminLoginDto adminLoginDto);
}
