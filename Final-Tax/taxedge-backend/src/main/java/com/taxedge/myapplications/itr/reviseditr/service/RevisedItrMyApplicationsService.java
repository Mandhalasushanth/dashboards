package com.taxedge.myapplications.itr.reviseditr.service;

import java.util.List;

import com.taxedge.myapplications.itr.reviseditr.dto.RevisedItrMyApplicationResponseDto;

public interface RevisedItrMyApplicationsService {
    List<RevisedItrMyApplicationResponseDto> getMyRevisedItrApplications(String custId);
}
