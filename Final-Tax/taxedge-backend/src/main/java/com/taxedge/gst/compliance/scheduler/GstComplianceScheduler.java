package com.taxedge.gst.compliance.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.gst.compliance.repository.GstComplianceRepository;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class GstComplianceScheduler {

	@Value("${DRAFT_RETENTION_MINUTES}")
	private int draftRetentionMinutes;

	private final GstComplianceRepository gstComplianceRepository;

	// Runs every minute
	@Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
	@Transactional
	public void deleteOldDrafts() {
		LocalDateTime cutoff = LocalDateTime.now().minusMinutes(draftRetentionMinutes);

		List<GstCompliance> oldDrafts = gstComplianceRepository
				.findByStatusAndUpdatedAtBefore(RegisterationStatus.DRAFT, cutoff);

		if (oldDrafts.isEmpty()) {
			log.info("GST compliance draft cleanup: no drafts older than {}", cutoff);
			return;
		}

		gstComplianceRepository.deleteAll(oldDrafts);
		log.info("GST compliance draft cleanup: deleted {} DRAFT GST compliances older than {}",
				oldDrafts.size(), cutoff);
	}

}
