package com.taxedge.gst.compliance.dto;

import com.taxedge.gst.compliance.enums.ComplianceRequestType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstComplianceResponseDto {

    private String complianceId;

    private String status;

    private ComplianceRequestType requestType;
}
