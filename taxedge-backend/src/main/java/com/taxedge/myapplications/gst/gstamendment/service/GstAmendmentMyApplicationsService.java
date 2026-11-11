package com.taxedge.myapplications.gst.gstamendment.service;

import java.util.List;

import com.taxedge.myapplications.gst.gstamendment.dto.GstAmendmentMyApplicationResponseDto;

public interface GstAmendmentMyApplicationsService {

    List<GstAmendmentMyApplicationResponseDto> getMyAmendmentApplications(String custId);
}
