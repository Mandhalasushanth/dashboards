package com.taxedge.myapplications.gst.gstregistration.service;

import java.util.List;

import com.taxedge.myapplications.gst.gstregistration.dto.MyApplicationResponseDto;

public interface MyApplicationsService {

    List<MyApplicationResponseDto> getMyApplications(String custId);
}
