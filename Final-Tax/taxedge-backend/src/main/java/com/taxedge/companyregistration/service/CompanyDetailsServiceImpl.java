package com.taxedge.companyregistration.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.companyregistration.dto.CompanyDetailsDto;
import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.companyregistration.mapper.CompanyDetailsMapper;
import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.customer.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyDetailsServiceImpl implements CompanyDetailsService {

	private final CompanyDetailsRepository companyDetailsRepository;
	private final CustomerRepository customerRepository;
	private final CompanyDetailsMapper companyDetailsMapper;

	@Override
	public String registerCompany(CompanyDetailsDto dto) {

		Customer customer = customerRepository.findById(dto.getCustomerId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

		CompanyDetails companyDetails = CompanyDetails.builder()
				.companyRegistrationId("COM" + UUID.randomUUID().toString().replace("-", "")).customer(customer)
				.build();

		companyDetailsMapper.updateEntity(dto, companyDetails);

		companyDetails.setCustomer(customer);

		companyDetailsRepository.save(companyDetails);

		return "Company details successfully registered. Company Registration ID: "
				+ companyDetails.getCompanyRegistrationId();
	}

	@Override
	@Transactional(readOnly = true)
	public CompanyDetailsDto getCompanyDetails(String companyRegistrationId) {

		CompanyDetails companyDetails = companyDetailsRepository.findById(companyRegistrationId).orElseThrow(
				() -> new ResourceNotFoundException("Company details not found with ID: " + companyRegistrationId));

		return companyDetailsMapper.toDto(companyDetails);
	}

	@Override
	public String updateCompanyDetails(String companyRegistrationId, CompanyDetailsDto dto) {

		CompanyDetails companyDetails = companyDetailsRepository.findById(companyRegistrationId).orElseThrow(
				() -> new ResourceNotFoundException("Company details not found with ID: " + companyRegistrationId));

		Customer customer = customerRepository.findById(dto.getCustomerId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

		companyDetailsMapper.updateEntity(dto, companyDetails);

		companyDetails.setCustomer(customer);

		companyDetailsRepository.save(companyDetails);

		return "Company details successfully updated. Company Registration ID: "
				+ companyDetails.getCompanyRegistrationId();
	}

	@Override
	public String deleteCompanyDetails(String companyRegistrationId) {

		CompanyDetails companyDetails = companyDetailsRepository.findById(companyRegistrationId).orElseThrow(
				() -> new ResourceNotFoundException("Company details not found with ID: " + companyRegistrationId));

		companyDetailsRepository.delete(companyDetails);

		return "Company details successfully deleted. Company Registration ID: " + companyRegistrationId;
	}
}
