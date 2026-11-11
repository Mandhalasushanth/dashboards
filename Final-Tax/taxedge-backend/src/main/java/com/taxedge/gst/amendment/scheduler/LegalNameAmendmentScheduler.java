package com.taxedge.gst.amendment.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.amendment.repository.LegalNameAmendmentRepository;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class LegalNameAmendmentScheduler {

	@Value("${DRAFT_RETENTION_MINUTES}")
	private int draftRetentionMinutes;

	private final LegalNameAmendmentRepository legalNameAmendmentRepository;

	// Runs every minute
	@Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
	@Transactional
	public void deleteOldDrafts() {
		LocalDateTime cutoff = LocalDateTime.now().minusMinutes(draftRetentionMinutes);

		List<LegalNameAmendmentEntity> oldDrafts = legalNameAmendmentRepository
				.findByStatusAndUpdatedAtBefore(RegisterationStatus.DRAFT, cutoff);

		if (oldDrafts.isEmpty()) {
			log.info("Legal name amendment draft cleanup: no drafts older than {}", cutoff);
			return;
		}

		legalNameAmendmentRepository.deleteAll(oldDrafts);
		log.info("Legal name amendment draft cleanup: deleted {} DRAFT legal name amendments older than {}",
				oldDrafts.size(), cutoff);
	}

}
