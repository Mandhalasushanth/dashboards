package com.taxedge.gst.compliance.service;

import java.io.IOException;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.compliance.dto.GstComplianceDto;
import com.taxedge.gst.compliance.dto.GstComplianceResponseDto;

import jakarta.validation.Valid;

@Validated
public interface GstComplianceService {

	GstComplianceResponseDto createCompliance(@Valid GstComplianceDto gstComplianceDto,
			MultipartFile reconciliationFile1, MultipartFile reconciliationFile2, MultipartFile noticeFile)
			throws IOException;

	GstComplianceDto getCompliance(String gstin, String id);

	GstComplianceResponseDto updateCompliance(String gstin, String id, @Valid GstComplianceDto gstComplianceDto,
			MultipartFile reconciliationFile1, MultipartFile reconciliationFile2, MultipartFile noticeFile)
			throws IOException;

	String deleteCompliance(String gstin, String id);

	String submitCompliance(String complianceId, String pushToken);
}
