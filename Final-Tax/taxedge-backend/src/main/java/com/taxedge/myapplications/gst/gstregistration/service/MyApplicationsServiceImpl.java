package com.taxedge.myapplications.gst.gstregistration.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.repository.BusinessRepository;
import com.taxedge.myapplications.gst.gstregistration.dto.MyApplicationResponseDto;
import com.taxedge.myapplications.gst.gstregistration.mapper.MyApplicationsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MyApplicationsServiceImpl implements MyApplicationsService {

    private final BusinessRepository businessRepository;
    private final MyApplicationsMapper myApplicationsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<MyApplicationResponseDto> getMyApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyApplications requested with empty custId");
            return Collections.emptyList();
        }

        List<Business> applications = businessRepository.findSubmittedByCustId(custId);
        return applications.stream()
                .map(myApplicationsMapper::toDto)
                .toList();
    }
}
