package com.taxedge.myapplications.itr.tdsrefund.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.itr.tdsrefund.entity.TdsRefund;
import com.taxedge.itr.tdsrefund.repository.TdsRefundRepository;
import com.taxedge.myapplications.itr.tdsrefund.dto.TdsRefundMyApplicationResponseDto;
import com.taxedge.myapplications.itr.tdsrefund.mapper.TdsRefundMyApplicationsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TdsRefundMyApplicationsServiceImpl implements TdsRefundMyApplicationsService {

    private final TdsRefundRepository tdsRefundRepository;
    private final TdsRefundMyApplicationsMapper tdsRefundMyApplicationsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TdsRefundMyApplicationResponseDto> getMyTdsRefundApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyTdsRefundApplications called with empty custId");
            return Collections.emptyList();
        }

        List<TdsRefund> refunds = tdsRefundRepository.findSubmittedByCustId(custId);
        return refunds.stream()
                .map(tdsRefundMyApplicationsMapper::toDto)
                .toList();
    }
}
