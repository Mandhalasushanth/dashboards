package com.taxedge.myapplications.gst.gstfiling.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.repository.GstFilingRepository;
import com.taxedge.myapplications.gst.gstfiling.dto.GstFilingMyApplicationResponseDto;
import com.taxedge.myapplications.gst.gstfiling.mapper.GstFilingMyApplicationsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GstFilingMyApplicationsServiceImpl implements GstFilingMyApplicationsService {

    private final GstFilingRepository gstFilingRepository;
    private final GstFilingMyApplicationsMapper gstFilingMyApplicationsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GstFilingMyApplicationResponseDto> getMyGstFilingApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyGstFilingApplications called with empty custId");
            return Collections.emptyList();
        }

        List<GstFiling> filings = gstFilingRepository.findSubmittedByCustId(custId);
        return filings.stream()
                .map(gstFilingMyApplicationsMapper::toDto)
                .toList();
    }
}
