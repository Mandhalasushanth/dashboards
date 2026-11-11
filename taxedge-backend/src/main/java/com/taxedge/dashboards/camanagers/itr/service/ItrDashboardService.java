package com.taxedge.dashboards.camanagers.itr.service;

import java.util.List;

import com.taxedge.dashboards.camanagers.itr.dto.ItrFilingDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.RevisedItrApplicationDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.TdsRefundDetailsDto;

public interface ItrDashboardService {

    List<TdsRefundDetailsDto> getAllTdsRefundDetails();

    List<ItrFilingDetailsDto> getAllItrFilingDetails();

    List<RevisedItrApplicationDetailsDto> getAllRevisedItrDetails();
}
