package com.taxedge.companyregistration.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.taxedge.companyregistration.dto.PromoterDirectorDetailsDto;
import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.entity.PromoterDirectorDetails;
import com.taxedge.companyregistration.entity.ShareholdingCapital;
import com.taxedge.companyregistration.entity.ShareholdingPattern;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.companyregistration.mapper.PromoterDirectorDetailsMapper;
import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.companyregistration.repository.PromoterDirectorDetailsRepository;
import com.taxedge.companyregistration.repository.ShareholdingCapitalRepository;
import com.taxedge.companyregistration.repository.ShareholdingPatternRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class PromoterDirectorDetailsServiceImpl implements PromoterDirectorDetailsService {

	private final PromoterDirectorDetailsRepository promoterDirectorDetailsRepository;
	private final CompanyDetailsRepository companyDetailsRepository;
	private final PromoterDirectorDetailsMapper promoterDirectorDetailsMapper;
	private final ShareholdingCapitalRepository shareholdingCapitalRepository;
	private final ShareholdingPatternRepository shareholdingPatternRepository;

	@Override
	public List<String> registerPromoterDirectorDetails(List<PromoterDirectorDetailsDto> dtoList) {

		List<String> responses = new ArrayList<>();
		if (dtoList == null || dtoList.isEmpty()) {
			return responses;
		}

		String companyRegistrationId = dtoList.get(0).getCompanyRegistrationId();
		CompanyDetails companyDetails = companyDetailsRepository.findById(companyRegistrationId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Company details not found with ID: " + companyRegistrationId));

		List<PromoterDirectorDetails> existingList = promoterDirectorDetailsRepository
				.findByCompanyDetails_CompanyRegistrationId(companyRegistrationId);

		List<String> retainedExistingIds = new ArrayList<>();

		for (PromoterDirectorDetailsDto dto : dtoList) {
			PromoterDirectorDetails matchingExisting = null;
			if (dto.getPromoterDirectorId() != null && !dto.getPromoterDirectorId().isBlank()) {
				matchingExisting = existingList.stream()
						.filter(e -> e.getPromoterDirectorId().equals(dto.getPromoterDirectorId()))
						.findFirst().orElse(null);
			}
			if (matchingExisting == null && dto.getPanNumber() != null && !dto.getPanNumber().isBlank()) {
				matchingExisting = existingList.stream()
						.filter(e -> dto.getPanNumber().equalsIgnoreCase(e.getPanNumber()))
						.findFirst().orElse(null);
			}

			if (matchingExisting != null) {
				matchingExisting.setFullName(dto.getFullName());
				matchingExisting.setPanNumber(dto.getPanNumber());
				matchingExisting.setDateOfBirth(dto.getDateOfBirth());
				matchingExisting.setDesignation(dto.getDesignation());
				matchingExisting.setEmailAddress(dto.getEmailAddress());
				matchingExisting.setMobileNumber(dto.getMobileNumber());
				matchingExisting.setDin(dto.getDin());
				matchingExisting.setRelationship(dto.getRelationship());
				matchingExisting.setAadhaarNumber(dto.getAadhaarNumber());
				promoterDirectorDetailsRepository.save(matchingExisting);
				retainedExistingIds.add(matchingExisting.getPromoterDirectorId());
				responses.add("Promoter/Director details updated. ID: " + matchingExisting.getPromoterDirectorId());
			} else {
				PromoterDirectorDetails details = PromoterDirectorDetails.builder()
						.promoterDirectorId("PD" + UUID.randomUUID().toString().replace("-", ""))
						.companyDetails(companyDetails).fullName(dto.getFullName()).panNumber(dto.getPanNumber())
						.dateOfBirth(dto.getDateOfBirth()).designation(dto.getDesignation())
						.emailAddress(dto.getEmailAddress()).mobileNumber(dto.getMobileNumber()).din(dto.getDin())
						.relationship(dto.getRelationship()).aadhaarNumber(dto.getAadhaarNumber()).build();

				promoterDirectorDetailsRepository.save(details);
				retainedExistingIds.add(details.getPromoterDirectorId());
				responses.add("Promoter/Director details successfully registered. Promoter/Director ID: "
						+ details.getPromoterDirectorId());
			}
		}

		// Clean up any promoters that were deleted by the user
		for (PromoterDirectorDetails existing : existingList) {
			if (!retainedExistingIds.contains(existing.getPromoterDirectorId())) {
				shareholdingPatternRepository.deleteByPromoterDirectorId(existing.getPromoterDirectorId());
				promoterDirectorDetailsRepository.delete(existing);
			}
		}

		return responses;
	}

	@Override
	@Transactional(readOnly = true)
	public List<PromoterDirectorDetailsDto> getAllPromoterDirectorDetails(String companyRegistrationId) {

		if (!companyDetailsRepository.existsById(companyRegistrationId)) {
			throw new ResourceNotFoundException("Company details not found with ID: " + companyRegistrationId);
		}

		List<PromoterDirectorDetails> detailsList = promoterDirectorDetailsRepository
				.findByCompanyDetails_CompanyRegistrationId(companyRegistrationId);

		return detailsList.stream().map(promoterDirectorDetailsMapper::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public PromoterDirectorDetailsDto getPromoterDirectorDetails(String promoterDirectorId) {

		PromoterDirectorDetails details = promoterDirectorDetailsRepository.findById(promoterDirectorId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Promoter/Director details not found with ID: " + promoterDirectorId));

		return promoterDirectorDetailsMapper.toDto(details);
	}

	@Override
	public String updatePromoterDirectorDetails(String promoterDirectorId, PromoterDirectorDetailsDto dto) {

		PromoterDirectorDetails existingDetails = promoterDirectorDetailsRepository.findById(promoterDirectorId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Promoter/Director details not found with ID: " + promoterDirectorId));

		promoterDirectorDetailsMapper.updateEntity(dto, existingDetails);

		if (dto.getCompanyRegistrationId() != null && !dto.getCompanyRegistrationId()
				.equals(existingDetails.getCompanyDetails().getCompanyRegistrationId())) {

			CompanyDetails companyDetails = companyDetailsRepository.findById(dto.getCompanyRegistrationId())
					.orElseThrow(() -> new ResourceNotFoundException(
							"Company details not found with ID: " + dto.getCompanyRegistrationId()));

			existingDetails.setCompanyDetails(companyDetails);
		}

		promoterDirectorDetailsRepository.save(existingDetails);

		return "Promoter/Director details updated successfully. ID: " + promoterDirectorId;
	}

	@Override
	@Transactional
	public String deletePromoterDirectorDetails(String promoterDirectorId) {

		PromoterDirectorDetails details = promoterDirectorDetailsRepository.findById(promoterDirectorId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Promoter/Director details not found with ID: " + promoterDirectorId));

		shareholdingPatternRepository.deleteByPromoterDirectorId(promoterDirectorId);

		promoterDirectorDetailsRepository.delete(details);

		return "Promoter/Director details and associated shareholding patterns deleted successfully. ID: "
				+ promoterDirectorId;
	}
}