package com.taxedge.itr.reviseditr.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.itr.reviseditr.dto.RevisedItrDetailsDto;
import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.entity.RevisedItrDetails;
import com.taxedge.itr.reviseditr.mapper.RevisedItrDetailsMapper;
import com.taxedge.itr.reviseditr.repository.RevisedItrDetailsRepository;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RevisedItrDetailsServiceImpl implements RevisedItrDetailsService {

	private final RevisedItrDetailsRepository revisedItrDetailsRepository;
	private final RevisedItrRepository revisedItrRepository;
	private final RevisedItrDetailsMapper revisedItrDetailsMapper;

	@Override
	public String createRevisedItrDetails(RevisedItrDetailsDto dto) {

		RevisedItr revisedItr = revisedItrRepository.findById(dto.getRevisedItrId())
				.orElseThrow(() -> new ResourceNotFoundException(
						"Revised ITR not found with revisedItrId: " + dto.getRevisedItrId()));

		// Upsert check: If details already exist for this revisedItrId, update them instead of inserting duplicate
		Optional<RevisedItrDetails> existingOpt = revisedItrDetailsRepository.findByRevisedItrRevisedItrId(dto.getRevisedItrId());
		if (existingOpt.isPresent()) {
			RevisedItrDetails existing = existingOpt.get();
			revisedItrDetailsMapper.updateEntity(dto, existing);
			revisedItrDetailsRepository.save(existing);
			return "Revised ITR details registered successfully. Details ID: " + existing.getDetailsId();
		}

		RevisedItrDetails details = RevisedItrDetails.builder()
				.detailsId("RITR" + UUID.randomUUID().toString().replace("-", ""))
				.salaryBusinessIncome(dto.getSalaryBusinessIncome()).otherIncome(dto.getOtherIncome())
				.deduction80C(dto.getDeduction80C()).deduction80D(dto.getDeduction80D())
				.homeLoanInterest(dto.getHomeLoanInterest()).taxableIncome(dto.getTaxableIncome())
				.bankAccountForRefund(dto.getBankAccountForRefund()).ifscCode(dto.getIfscCode()).revisedItr(revisedItr)
				.build();

		revisedItrDetailsRepository.save(details);

		return "Revised ITR details registered successfully. Details ID: " + details.getDetailsId();
	}

	@Override
	public String updateRevisedItrDetails(String detailsId, RevisedItrDetailsDto dto) {

		RevisedItrDetails details = revisedItrDetailsRepository.findById(detailsId).orElseThrow(
				() -> new ResourceNotFoundException("Revised ITR details not found with detailsId: " + detailsId));

		revisedItrDetailsMapper.updateEntity(dto, details);

		revisedItrDetailsRepository.save(details);

		return "Revised ITR details updated successfully. Details ID: " + details.getDetailsId();
	}

	@Override
	public RevisedItrDetailsDto getRevisedItrDetails(String detailsId) {

		RevisedItrDetails details = revisedItrDetailsRepository.findById(detailsId).orElseThrow(
				() -> new ResourceNotFoundException("Revised ITR details not found with detailsId: " + detailsId));

		return revisedItrDetailsMapper.toDto(details);
	}
}
