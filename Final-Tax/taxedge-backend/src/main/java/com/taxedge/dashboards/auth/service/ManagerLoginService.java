package com.taxedge.dashboards.auth.service;

import com.taxedge.dashboards.auth.dto.ManagerLoginDto;

/**
 * Service interface for manager accounts: creating manager accounts.
 * Management methods (listing, updating, deleting) are moved to CaManagerService.
 */
public interface ManagerLoginService {

    ManagerLoginDto createManager(ManagerLoginDto managerLoginDto);
}
