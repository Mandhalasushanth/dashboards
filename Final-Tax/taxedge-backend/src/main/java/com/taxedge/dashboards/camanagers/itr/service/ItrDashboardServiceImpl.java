package com.taxedge.dashboards.camanagers.itr.service;

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
public class ItrDashboardServiceImpl implements ItrDashboardService {

    private final TdsRefundRepository tdsRefundRepository;
    private final TdsRefundDetailsMapper tdsRefundDetailsMapper;
    private final ItrFilingRepository itrFilingRepository;
    private final ItrFilingDetailsMapper itrFilingDetailsMapper;
    private final RevisedItrRepository revisedItrRepository;
    private final RevisedItrApplicationDetailsMapper revisedItrApplicationDetailsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TdsRefundDetailsDto> getAllTdsRefundDetails() {
        log.info("Fetching all TDS refund applications with linked customer details for CA Manager dashboard");

        List<TdsRefund> refunds = tdsRefundRepository.findAllWithCustomer();

        if (refunds == null || refunds.isEmpty()) {
            return Collections.emptyList();
        }

        return tdsRefundDetailsMapper.toDtoList(refunds);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItrFilingDetailsDto> getAllItrFilingDetails() {
        log.info("Fetching all ITR filing applications with linked documents, salary income, and customer details for CA Manager dashboard");

        List<ItrFiling> filings = itrFilingRepository.findAllWithDetails();

        if (filings == null || filings.isEmpty()) {
            return Collections.emptyList();
        }

        return itrFilingDetailsMapper.toDtoList(filings);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevisedItrApplicationDetailsDto> getAllRevisedItrDetails() {
        log.info("Fetching all revised ITR applications with linked details, documents, revision reasons, and customer details for CA Manager dashboard");

        List<RevisedItr> revisedItrs = revisedItrRepository.findAllWithDetails();

        if (revisedItrs == null || revisedItrs.isEmpty()) {
            return Collections.emptyList();
        }

        return revisedItrApplicationDetailsMapper.toDtoList(revisedItrs);
    }
}
