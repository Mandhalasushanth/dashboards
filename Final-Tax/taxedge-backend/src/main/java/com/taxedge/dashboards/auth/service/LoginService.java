package com.taxedge.dashboards.auth.service;

import com.taxedge.dashboards.auth.dto.LoginRequestDto;
import com.taxedge.dashboards.auth.dto.LoginResponseDto;

/**
 * One sign-in for every account type: admins, managers and agents use the same login page.
 */
public interface LoginService {

    LoginResponseDto login(LoginRequestDto loginRequestDto);
}
