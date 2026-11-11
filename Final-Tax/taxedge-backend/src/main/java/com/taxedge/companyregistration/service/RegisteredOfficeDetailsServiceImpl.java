package com.taxedge.companyregistration.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.taxedge.companyregistration.dto.RegisteredOfficeDetailsDto;
import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.entity.RegisteredOfficeDetails;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.companyregistration.mapper.RegisteredOfficeDetailsMapper;
import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.companyregistration.repository.RegisteredOfficeDetailsRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class RegisteredOfficeDetailsServiceImpl implements RegisteredOfficeDetailsService {

	private final RegisteredOfficeDetailsRepository registeredOfficeDetailsRepository;
	private final CompanyDetailsRepository companyDetailsRepository;
	private final RegisteredOfficeDetailsMapper registeredOfficeDetailsMapper;

	@Override
	public String registerRegisteredOfficeDetails(RegisteredOfficeDetailsDto dto) {

		CompanyDetails companyDetails = companyDetailsRepository.findById(dto.getCompanyRegistrationId())
				.orElseThrow(() -> new ResourceNotFoundException(
						"Company details not found with ID: " + dto.getCompanyRegistrationId()));

		RegisteredOfficeDetails registeredOfficeDetails = RegisteredOfficeDetails.builder()
				.registeredOfficeId("RO" + UUID.randomUUID().toString().replace("-", "")).companyDetails(companyDetails)
				.buildingPremisesAddressLine(dto.getBuildingPremisesAddressLine()).city(dto.getCity())
				.district(dto.getDistrict()).state(dto.getState()).pinCode(dto.getPinCode())
				.premisesOwnership(dto.getPremisesOwnership()).companyEmail(dto.getCompanyEmail())
				.mobileNumber(dto.getMobileNumber()).build();

		registeredOfficeDetailsRepository.save(registeredOfficeDetails);

		return "Registered office details successfully registered. Registered Office ID: "
				+ registeredOfficeDetails.getRegisteredOfficeId();
	}

	@Override
	@Transactional(readOnly = true)
	public RegisteredOfficeDetailsDto getRegisteredOfficeDetails(String registeredOfficeId) {

		RegisteredOfficeDetails registeredOfficeDetails = registeredOfficeDetailsRepository.findById(registeredOfficeId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Registered office details not found with ID: " + registeredOfficeId));

		return registeredOfficeDetailsMapper.toDto(registeredOfficeDetails);
	}

	@Override
	public String updateRegisteredOfficeDetails(String registeredOfficeId, RegisteredOfficeDetailsDto dto) {

		RegisteredOfficeDetails registeredOfficeDetails = registeredOfficeDetailsRepository.findById(registeredOfficeId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Registered office details not found with ID: " + registeredOfficeId));

		registeredOfficeDetailsMapper.updateEntity(dto, registeredOfficeDetails);

		if (dto.getCompanyRegistrationId() != null && !dto.getCompanyRegistrationId()
				.equals(registeredOfficeDetails.getCompanyDetails().getCompanyRegistrationId())) {

			CompanyDetails companyDetails = companyDetailsRepository.findById(dto.getCompanyRegistrationId())
					.orElseThrow(() -> new ResourceNotFoundException(
							"Company details not found with ID: " + dto.getCompanyRegistrationId()));

			registeredOfficeDetails.setCompanyDetails(companyDetails);
		}

		registeredOfficeDetailsRepository.save(registeredOfficeDetails);

		return "Registered office details updated successfully. ID: " + registeredOfficeId;
	}

	@Override
    public String deleteRegisteredOfficeDetails(String registeredOfficeId) {

        RegisteredOfficeDetails registeredOfficeDetails =
                registeredOfficeDetailsRepository.findById(registeredOfficeId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Registered office details not found with ID: "
                                        + registeredOfficeId));

        registeredOfficeDetailsRepository.delete(registeredOfficeDetails);

        return "Registered office details deleted successfully. ID: "
                + registeredOfficeId;
    }
}