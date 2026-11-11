package com.taxedge.myapplications.itr.itrfiling.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.repository.ItrFilingRepository;
import com.taxedge.myapplications.itr.itrfiling.dto.ItrFilingMyApplicationResponseDto;
import com.taxedge.myapplications.itr.itrfiling.mapper.ItrFilingMyApplicationsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItrFilingMyApplicationsServiceImpl implements ItrFilingMyApplicationsService {

    private final ItrFilingRepository itrFilingRepository;
    private final ItrFilingMyApplicationsMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ItrFilingMyApplicationResponseDto> getMyItrFilingApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyItrFilingApplications called with empty custId");
            return Collections.emptyList();
        }

        List<ItrFiling> filings = itrFilingRepository.findSubmittedByCustId(custId);
        return filings.stream()
                .map(mapper::toDto)
                .toList();
    }
}
