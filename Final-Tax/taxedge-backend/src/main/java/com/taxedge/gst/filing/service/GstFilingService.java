package com.taxedge.gst.filing.service;

import com.taxedge.gst.filing.dto.GstFilingDto;

public interface GstFilingService {

    String createFiling(GstFilingDto gstFilingDto);

    GstFilingDto getFilingById(String id);

    String updateFiling(String id, GstFilingDto gstFilingDto);

    String deleteFiling(String id);
    
    String submitFiling(String filingId, String pushToken);
}
