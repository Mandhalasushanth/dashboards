package com.taxedge.dashboards.agents.itr.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.agents.itr.service.ItrAgentDashboardService;
import com.taxedge.dashboards.camanagers.itr.dto.ItrFilingDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.RevisedItrApplicationDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.TdsRefundDetailsDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class ItrAgentDashboardController {

    private final ItrAgentDashboardService itrAgentDashboardService;

    @GetMapping("/tds-refunds/{agentId}")
    public ResponseEntity<List<TdsRefundDetailsDto>> getAssignedTdsRefunds(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned TDS refunds for agent ID [{}]", agentId);
        List<TdsRefundDetailsDto> response = itrAgentDashboardService.getAssignedTdsRefundsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/itr-filings/{agentId}")
    public ResponseEntity<List<ItrFilingDetailsDto>> getAssignedItrFilings(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned ITR filings for agent ID [{}]", agentId);
        List<ItrFilingDetailsDto> response = itrAgentDashboardService.getAssignedItrFilingsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/revised-itrs/{agentId}")
    public ResponseEntity<List<RevisedItrApplicationDetailsDto>> getAssignedRevisedItrs(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned Revised ITRs for agent ID [{}]", agentId);
        List<RevisedItrApplicationDetailsDto> response = itrAgentDashboardService.getAssignedRevisedItrsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }
}

