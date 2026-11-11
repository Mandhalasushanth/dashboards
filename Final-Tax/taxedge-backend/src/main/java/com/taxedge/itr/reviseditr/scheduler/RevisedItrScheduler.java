package com.taxedge.itr.reviseditr.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class RevisedItrScheduler {

	@Value("${DRAFT_RETENTION_MINUTES}")
	private int draftRetentionMinutes;

	private final RevisedItrRepository revisedItrRepository;

	// Runs every minute
	@Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
	@Transactional
	public void deleteOldDrafts() {
		LocalDateTime cutoff = LocalDateTime.now().minusMinutes(draftRetentionMinutes);

		List<RevisedItr> oldDrafts = revisedItrRepository
				.findByStatusAndUpdatedAtBefore(RegisterationStatus.DRAFT, cutoff);

		if (oldDrafts.isEmpty()) {
			log.info("Revised ITR draft cleanup: no drafts older than {}", cutoff);
			return;
		}

		revisedItrRepository.deleteAll(oldDrafts); // also deletes linked details, documents, and revisionReasons (cascade)
		log.info("Revised ITR draft cleanup: deleted {} DRAFT Revised ITRs older than {}",
				oldDrafts.size(), cutoff);
	}

}
