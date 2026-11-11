package com.taxedge.gst.filing.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.repository.GstFilingRepository;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class GstFilingScheduler {

	@Value("${DRAFT_RETENTION_MINUTES}")
	private int draftRetentionMinutes;

	private final GstFilingRepository gstFilingRepository;

	// Runs every minute
	@Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
	@Transactional
	public void deleteOldDrafts() {
		LocalDateTime cutoff = LocalDateTime.now().minusMinutes(draftRetentionMinutes);

		List<GstFiling> oldDrafts = gstFilingRepository
				.findByStatusAndUpdatedAtBefore(RegisterationStatus.DRAFT, cutoff);

		if (oldDrafts.isEmpty()) {
			log.info("GST filing draft cleanup: no drafts older than {}", cutoff);
			return;
		}

		gstFilingRepository.deleteAll(oldDrafts); // also deletes linked documents (cascade)
		log.info("GST filing draft cleanup: deleted {} DRAFT GST filings older than {}",
				oldDrafts.size(), cutoff);
	}

}
