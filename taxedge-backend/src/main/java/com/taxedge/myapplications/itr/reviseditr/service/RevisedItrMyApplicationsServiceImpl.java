package com.taxedge.myapplications.itr.reviseditr.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;
import com.taxedge.myapplications.itr.reviseditr.dto.RevisedItrMyApplicationResponseDto;
import com.taxedge.myapplications.itr.reviseditr.mapper.RevisedItrMyApplicationsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevisedItrMyApplicationsServiceImpl implements RevisedItrMyApplicationsService {

    private final RevisedItrRepository revisedItrRepository;
    private final RevisedItrMyApplicationsMapper revisedItrMyApplicationsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RevisedItrMyApplicationResponseDto> getMyRevisedItrApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyRevisedItrApplications called with empty custId");
            return Collections.emptyList();
        }

        List<RevisedItr> revisedList = revisedItrRepository.findSubmittedByCustId(custId);
        return revisedList.stream()
                .map(revisedItrMyApplicationsMapper::toDto)
                .toList();
    }
}
