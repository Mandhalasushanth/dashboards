package com.taxedge.gst.amendment.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.gst.amendment.entity.AdditionalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.repository.AdditionalPlaceAmendmentRepository;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class AdditionalPlaceAmendmentScheduler {

	@Value("${DRAFT_RETENTION_MINUTES}")
	private int draftRetentionMinutes;

	private final AdditionalPlaceAmendmentRepository additionalPlaceRepository;

	// Runs every minute
	@Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
	@Transactional
	public void deleteOldDrafts() {
		LocalDateTime cutoff = LocalDateTime.now().minusMinutes(draftRetentionMinutes);

		List<AdditionalPlaceAmendmentEntity> oldDrafts = additionalPlaceRepository
				.findByStatusAndUpdatedAtBefore(RegisterationStatus.DRAFT, cutoff);

		if (oldDrafts.isEmpty()) {
			log.info("Additional place amendment draft cleanup: no drafts older than {}", cutoff);
			return;
		}

		additionalPlaceRepository.deleteAll(oldDrafts);
		log.info("Additional place amendment draft cleanup: deleted {} DRAFT additional place amendments older than {}",
				oldDrafts.size(), cutoff);
	}

}
