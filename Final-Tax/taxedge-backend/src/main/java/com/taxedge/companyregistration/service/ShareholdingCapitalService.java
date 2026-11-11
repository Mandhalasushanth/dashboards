package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.ShareholdingCapitalDto;

public interface ShareholdingCapitalService {

	String registerShareholdingCapital(ShareholdingCapitalDto dto);

	ShareholdingCapitalDto getShareholdingCapitalById(String shareholdingCapitalId);

	String updateShareholdingCapital(String shareholdingCapitalId, ShareholdingCapitalDto dto);

	String deleteShareholdingCapital(String shareholdingCapitalId);
}