package com.taxedge.myapplications.itr.itrfiling.service;

import java.util.List;

import com.taxedge.myapplications.itr.itrfiling.dto.ItrFilingMyApplicationResponseDto;

public interface ItrFilingMyApplicationsService {
    List<ItrFilingMyApplicationResponseDto> getMyItrFilingApplications(String custId);
}
