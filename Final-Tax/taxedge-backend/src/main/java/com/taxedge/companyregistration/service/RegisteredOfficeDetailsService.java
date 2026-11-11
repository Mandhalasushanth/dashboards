package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.RegisteredOfficeDetailsDto;

public interface RegisteredOfficeDetailsService {

	String registerRegisteredOfficeDetails(RegisteredOfficeDetailsDto dto);

	RegisteredOfficeDetailsDto getRegisteredOfficeDetails(String registeredOfficeId);

	String updateRegisteredOfficeDetails(String registeredOfficeId, RegisteredOfficeDetailsDto dto);

	String deleteRegisteredOfficeDetails(String registeredOfficeId);
}