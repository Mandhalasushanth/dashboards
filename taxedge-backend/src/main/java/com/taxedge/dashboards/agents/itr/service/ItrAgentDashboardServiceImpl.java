package com.taxedge.dashboards.agents.itr.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.camanagers.itr.dto.ItrFilingDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.RevisedItrApplicationDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.TdsRefundDetailsDto;
import com.taxedge.dashboards.camanagers.itr.mapper.ItrFilingDetailsMapper;
import com.taxedge.dashboards.camanagers.itr.mapper.RevisedItrApplicationDetailsMapper;
import com.taxedge.dashboards.camanagers.itr.mapper.TdsRefundDetailsMapper;
import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.repository.ItrFilingRepository;
import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;
import com.taxedge.itr.tdsrefund.entity.TdsRefund;
import com.taxedge.itr.tdsrefund.repository.TdsRefundRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItrAgentDashboardServiceImpl implements ItrAgentDashboardService {

    private final TdsRefundRepository tdsRefundRepository;
    private final TdsRefundDetailsMapper tdsRefundDetailsMapper;
    private final ItrFilingRepository itrFilingRepository;
    private final ItrFilingDetailsMapper itrFilingDetailsMapper;
    private final RevisedItrRepository revisedItrRepository;
    private final RevisedItrApplicationDetailsMapper revisedItrApplicationDetailsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TdsRefundDetailsDto> getAssignedTdsRefundsByAgentId(Long agentId) {
        log.info("Fetching assigned TDS refunds for agent ID [{}]", agentId);

        List<TdsRefund> refunds = tdsRefundRepository.findByAssignedAgentId(agentId);

        if (refunds == null || refunds.isEmpty()) {
            return Collections.emptyList();
        }

        return tdsRefundDetailsMapper.toDtoList(refunds);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItrFilingDetailsDto> getAssignedItrFilingsByAgentId(Long agentId) {
        log.info("Fetching assigned ITR filings for agent ID [{}]", agentId);

        List<ItrFiling> filings = itrFilingRepository.findByAssignedAgentId(agentId);

        if (filings == null || filings.isEmpty()) {
            return Collections.emptyList();
        }

        return itrFilingDetailsMapper.toDtoList(filings);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevisedItrApplicationDetailsDto> getAssignedRevisedItrsByAgentId(Long agentId) {
        log.info("Fetching assigned Revised ITRs for agent ID [{}]", agentId);

        List<RevisedItr> revisedItrs = revisedItrRepository.findByAssignedAgentId(agentId);

        if (revisedItrs == null || revisedItrs.isEmpty()) {
            return Collections.emptyList();
        }

        return revisedItrApplicationDetailsMapper.toDtoList(revisedItrs);
    }
}

