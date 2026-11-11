package com.taxedge.myapplications.gst.gstcompliance.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.gst.compliance.repository.GstComplianceRepository;
import com.taxedge.myapplications.gst.gstcompliance.dto.GstComplianceMyApplicationResponseDto;
import com.taxedge.myapplications.gst.gstcompliance.mapper.GstComplianceMyApplicationsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GstComplianceMyApplicationsServiceImpl implements GstComplianceMyApplicationsService {

    private final GstComplianceRepository gstComplianceRepository;
    private final GstComplianceMyApplicationsMapper gstComplianceMyApplicationsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GstComplianceMyApplicationResponseDto> getMyGstComplianceApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyGstComplianceApplications called with empty custId");
            return Collections.emptyList();
        }

        List<GstCompliance> compliances = gstComplianceRepository.findSubmittedByCustId(custId);
        return compliances.stream()
                .map(gstComplianceMyApplicationsMapper::toDto)
                .toList();
    }
}
