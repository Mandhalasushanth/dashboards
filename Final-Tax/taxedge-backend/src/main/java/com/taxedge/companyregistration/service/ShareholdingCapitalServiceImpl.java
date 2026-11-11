package com.taxedge.companyregistration.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.companyregistration.dto.ShareholdingCapitalDto;
import com.taxedge.companyregistration.dto.ShareholdingPatternDto;
import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.entity.PromoterDirectorDetails;
import com.taxedge.companyregistration.entity.ShareholdingCapital;
import com.taxedge.companyregistration.entity.ShareholdingPattern;
import com.taxedge.companyregistration.mapper.ShareholdingCapitalMapper;
import com.taxedge.companyregistration.mapper.ShareholdingPatternMapper;
import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.companyregistration.repository.PromoterDirectorDetailsRepository;
import com.taxedge.companyregistration.repository.ShareholdingCapitalRepository;
import com.taxedge.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ShareholdingCapitalServiceImpl implements ShareholdingCapitalService {

	private final ShareholdingCapitalRepository capitalRepository;
	private final CompanyDetailsRepository companyRepository;
	private final PromoterDirectorDetailsRepository promoterRepository;
	private final ShareholdingCapitalMapper capitalMapper;
	private final ShareholdingPatternMapper patternMapper;

	@Override
	public String registerShareholdingCapital(ShareholdingCapitalDto dto) {

		CompanyDetails company = findCompany(dto.getCompanyRegistrationId());

		java.util.Optional<ShareholdingCapital> existingOpt = capitalRepository.findByCompanyDetails_CompanyRegistrationId(dto.getCompanyRegistrationId());
		if (existingOpt.isPresent()) {
			return updateShareholdingCapital(existingOpt.get().getShareholdingCapitalId(), dto);
		}

		validatePatternPromoters(dto, company);

		ShareholdingCapital capital = capitalMapper.toEntity(dto);

		capital.setShareholdingCapitalId("SHC" + UUID.randomUUID().toString().replace("-", ""));
		capital.setCompanyDetails(company);

		List<ShareholdingPattern> patterns = dto.getShareholdingPattern().stream()
				.map(patternDto -> createPattern(patternDto, capital, company)).collect(Collectors.toList());

		capital.setShareholdingPattern(patterns);
		capitalRepository.save(capital);

		return "Shareholding capital registered successfully. ID: " + capital.getShareholdingCapitalId();
	}

	@Override
	@Transactional(readOnly = true)
	public ShareholdingCapitalDto getShareholdingCapitalById(String shareholdingCapitalId) {

		return capitalMapper.toDto(findCapital(shareholdingCapitalId));
	}

	@Override
	public String updateShareholdingCapital(String shareholdingCapitalId, ShareholdingCapitalDto dto) {

		ShareholdingCapital capital = findCapital(shareholdingCapitalId);

		String existingCompanyId = capital.getCompanyDetails().getCompanyRegistrationId();

		if (!existingCompanyId.equals(dto.getCompanyRegistrationId())) {
			throw new IllegalArgumentException("Shareholding capital cannot be reassigned to another company.");
		}

		CompanyDetails company = findCompany(existingCompanyId);
		validatePatternPromoters(dto, company);

		capitalMapper.updateEntity(dto, capital);

		List<ShareholdingPattern> existingPatterns = capital.getShareholdingPattern();
		List<ShareholdingPattern> updatedList = new ArrayList<>();

		for (ShareholdingPatternDto patternDto : dto.getShareholdingPattern()) {
			PromoterDirectorDetails promoter = findAndValidatePromoter(patternDto.getPromoterDirectorId(),
					company.getCompanyRegistrationId());

			ShareholdingPattern existing = existingPatterns.stream()
					.filter(p -> p.getPromoterDirectorDetails() != null &&
							p.getPromoterDirectorDetails().getPromoterDirectorId().equals(promoter.getPromoterDirectorId()))
					.findFirst().orElse(null);

			if (existing != null) {
				existing.setAllocatedShares(patternDto.getAllocatedShares());
				existing.setAmount(patternDto.getAmount());
				updatedList.add(existing);
			} else {
				ShareholdingPattern pattern = createPattern(patternDto, capital, company);
				updatedList.add(pattern);
			}
		}

		existingPatterns.retainAll(updatedList);
		for (ShareholdingPattern p : updatedList) {
			if (!existingPatterns.contains(p)) {
				existingPatterns.add(p);
			}
		}

		capitalRepository.save(capital);

		return "Shareholding capital updated successfully. ID: " + capital.getShareholdingCapitalId();
	}

	
	@Override
	public String deleteShareholdingCapital(String shareholdingCapitalId) {

		ShareholdingCapital capital = findCapital(shareholdingCapitalId);

		capitalRepository.delete(capital);

		return "Shareholding capital deleted successfully.";
	}

	private ShareholdingPattern createPattern(ShareholdingPatternDto dto, ShareholdingCapital capital,
			CompanyDetails company) {

		PromoterDirectorDetails promoter = findAndValidatePromoter(dto.getPromoterDirectorId(),
				company.getCompanyRegistrationId());

		ShareholdingPattern pattern = patternMapper.toEntity(dto);

		pattern.setShareholdingPatternId("SHP" + UUID.randomUUID().toString().replace("-", ""));
		pattern.setShareholdingCapital(capital);
		pattern.setCompanyDetails(company);
		pattern.setPromoterDirectorDetails(promoter);

		return pattern;
	}

	private void validatePatternPromoters(ShareholdingCapitalDto dto, CompanyDetails company) {

		List<PromoterDirectorDetails> promoters = promoterRepository
				.findByCompanyDetails_CompanyRegistrationId(company.getCompanyRegistrationId());

		if (dto.getShareholdingPattern().size() != promoters.size()) {
			throw new IllegalArgumentException("The number of shareholding pattern entries must match "
					+ "the number of promoters/directors registered for the company.");
		}

		Set<String> promoterIds = new HashSet<>();

		for (ShareholdingPatternDto patternDto : dto.getShareholdingPattern()) {

			if (!promoterIds.add(patternDto.getPromoterDirectorId())) {
				throw new IllegalArgumentException("Duplicate promoter/director ID in shareholding pattern: "
						+ patternDto.getPromoterDirectorId());
			}

			findAndValidatePromoter(patternDto.getPromoterDirectorId(), company.getCompanyRegistrationId());
		}
	}

	private PromoterDirectorDetails findAndValidatePromoter(String promoterDirectorId, String companyRegistrationId) {

		PromoterDirectorDetails promoter = promoterRepository.findById(promoterDirectorId)
				.orElseThrow(() -> new ResourceNotFoundException("Promoter/Director not found: " + promoterDirectorId));

		if (!promoter.getCompanyDetails().getCompanyRegistrationId().equals(companyRegistrationId)) {

			throw new IllegalArgumentException(
					"Promoter/Director " + promoterDirectorId + " does not belong to company " + companyRegistrationId);
		}

		return promoter;
	}

	private CompanyDetails findCompany(String companyRegistrationId) {

		return companyRepository.findById(companyRegistrationId)
				.orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyRegistrationId));
	}

	private ShareholdingCapital findCapital(String shareholdingCapitalId) {

		return capitalRepository.findById(shareholdingCapitalId).orElseThrow(
				() -> new ResourceNotFoundException("Shareholding capital not found: " + shareholdingCapitalId));
	}
}