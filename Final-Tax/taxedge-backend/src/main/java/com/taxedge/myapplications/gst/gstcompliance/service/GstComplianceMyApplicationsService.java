package com.taxedge.myapplications.gst.gstcompliance.service;

import java.util.List;

import com.taxedge.myapplications.gst.gstcompliance.dto.GstComplianceMyApplicationResponseDto;

public interface GstComplianceMyApplicationsService {

    List<GstComplianceMyApplicationResponseDto> getMyGstComplianceApplications(String custId);
}
