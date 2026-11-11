package com.taxedge.myapplications.itr.tdsrefund.service;

import java.util.List;

import com.taxedge.myapplications.itr.tdsrefund.dto.TdsRefundMyApplicationResponseDto;

public interface TdsRefundMyApplicationsService {
    List<TdsRefundMyApplicationResponseDto> getMyTdsRefundApplications(String custId);
}
