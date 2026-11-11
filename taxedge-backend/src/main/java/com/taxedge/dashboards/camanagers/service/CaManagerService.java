package com.taxedge.dashboards.camanagers.service;

import java.util.List;

import com.taxedge.dashboards.auth.dto.ManagerLoginDto;
import com.taxedge.dashboards.auth.enums.ManagerRole;

public interface CaManagerService {

    List<ManagerLoginDto> getManagers(ManagerRole role);

    ManagerLoginDto getManagerById(Long id);

    ManagerLoginDto updateManager(Long id, ManagerLoginDto managerLoginDto);

    void deleteManager(Long id);
}

