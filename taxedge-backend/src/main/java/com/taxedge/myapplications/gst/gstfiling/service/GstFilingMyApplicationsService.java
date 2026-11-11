package com.taxedge.myapplications.gst.gstfiling.service;

import java.util.List;

import com.taxedge.myapplications.gst.gstfiling.dto.GstFilingMyApplicationResponseDto;

public interface GstFilingMyApplicationsService {

    List<GstFilingMyApplicationResponseDto> getMyGstFilingApplications(String custId);
}
