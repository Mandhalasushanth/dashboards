package com.taxedge.gst.registration.Scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.gst.registration.repository.BusinessRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class GstRegScheduler {
	
	@Value("${DRAFT_RETENTION_MINUTES}")
	private int draftRetentionMinutes;

	private final BusinessRepository businessRepository;

	// Runs every day at 2:00 AM IST
//	@Scheduled(cron = "0 0 2 * * *", zone = "Asia/Kolkata")
	@Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
	@Transactional
	public void deleteOldDrafts() {
		LocalDateTime cutoff = LocalDateTime.now().minusMinutes(draftRetentionMinutes);

		List<Business> oldDrafts = businessRepository
				.findByStatusAndUpdatedAtBefore(RegisterationStatus.DRAFT, cutoff);

		if (oldDrafts.isEmpty()) {
			log.info("Draft cleanup: no drafts older than {}", cutoff);
			return;
		}

		businessRepository.deleteAll(oldDrafts); // also deletes linked Documents (cascade)
		log.info("Draft cleanup: deleted {} DRAFT GST registrations older than {}",
				oldDrafts.size(), cutoff);
	}

}
