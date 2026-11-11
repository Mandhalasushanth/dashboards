package com.taxedge.itr.reviseditr.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.itr.reviseditr.dto.RevisionReasonDto;
import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.entity.RevisionReasonEntity;
import com.taxedge.itr.reviseditr.mapper.RevisionReasonMapper;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;
import com.taxedge.itr.reviseditr.repository.RevisionReasonRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RevisionReasonServiceImpl implements RevisionReasonService {

	private final RevisionReasonRepository revisionReasonRepository;
	private final RevisedItrRepository revisedItrRepository;
	private final RevisionReasonMapper revisionReasonMapper;

	@Override
	public String createRevisionReason(RevisionReasonDto dto) {

		validateReason(dto);

		RevisedItr revisedItr = revisedItrRepository.findById(dto.getRevisedItrId())
				.orElseThrow(() -> new ResourceNotFoundException(
						"Revised ITR not found with revisedItrId: " + dto.getRevisedItrId()));

		// Upsert check: If reason already exists for this revisedItrId, update it instead of inserting duplicate
		Optional<RevisionReasonEntity> existingOpt = revisionReasonRepository.findByRevisedItrRevisedItrId(dto.getRevisedItrId());
		if (existingOpt.isPresent()) {
			RevisionReasonEntity existing = existingOpt.get();
			revisionReasonMapper.updateEntity(dto, existing);
			revisionReasonRepository.save(existing);
			return "Revision reason registered successfully. Revision Reason ID: " + existing.getRevisionReasonId();
		}

		RevisionReasonEntity revisionReason = RevisionReasonEntity.builder()
				.revisionReasonId("RR" + UUID.randomUUID().toString().replace("-", "")).reason(dto.getReason())
				.otherReason(dto.getOtherReason()).revisedItr(revisedItr).build();

		revisionReasonRepository.save(revisionReason);

		return "Revision reason registered successfully. Revision Reason ID: " + revisionReason.getRevisionReasonId();
	}

	@Override
	public String updateRevisionReason(String revisionReasonId, RevisionReasonDto dto) {

		RevisionReasonEntity revisionReason = revisionReasonRepository.findById(revisionReasonId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Revision reason not found with revisionReasonId: " + revisionReasonId));

		validateReason(dto);

		revisionReasonMapper.updateEntity(dto, revisionReason);

		revisionReasonRepository.save(revisionReason);

		return "Revision reason updated successfully";
	}

	@Override
	public RevisionReasonDto getRevisionReason(String revisionReasonId) {

		RevisionReasonEntity revisionReason = revisionReasonRepository.findById(revisionReasonId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Revision reason not found with revisionReasonId: " + revisionReasonId));

		return revisionReasonMapper.toDto(revisionReason);
	}

	private void validateReason(RevisionReasonDto dto) {

		if (dto.getReason() == null) {
			throw new IllegalArgumentException("Reason is required");
		}

		if (dto.getReason().name().equals("OTHER")
				&& (dto.getOtherReason() == null || dto.getOtherReason().trim().isEmpty())) {

			throw new IllegalArgumentException("Other reason is required when reason is OTHER");
		}
	}
}
