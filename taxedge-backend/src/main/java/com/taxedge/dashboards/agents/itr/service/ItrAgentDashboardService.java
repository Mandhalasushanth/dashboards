package com.taxedge.dashboards.agents.itr.service;

import java.util.List;

import com.taxedge.dashboards.camanagers.itr.dto.ItrFilingDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.RevisedItrApplicationDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.TdsRefundDetailsDto;

public interface ItrAgentDashboardService {

    List<TdsRefundDetailsDto> getAssignedTdsRefundsByAgentId(Long agentId);

    List<ItrFilingDetailsDto> getAssignedItrFilingsByAgentId(Long agentId);

    List<RevisedItrApplicationDetailsDto> getAssignedRevisedItrsByAgentId(Long agentId);
}

