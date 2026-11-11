package com.taxedge.itr.tdsrefund.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.tdsrefund.entity.TdsRefund;
import com.taxedge.itr.tdsrefund.repository.TdsRefundRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class TdsRefundScheduler {

	@Value("${DRAFT_RETENTION_MINUTES}")
	private int draftRetentionMinutes;

	private final TdsRefundRepository repository;

	// Runs every minute
	@Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
	@Transactional
	public void deleteOldDrafts() {
		LocalDateTime cutoff = LocalDateTime.now().minusMinutes(draftRetentionMinutes);

		List<TdsRefund> oldDrafts = repository
				.findByStatusAndUpdatedAtBefore(RegisterationStatus.DRAFT, cutoff);

		if (oldDrafts.isEmpty()) {
			log.info("TDS refund draft cleanup: no drafts older than {}", cutoff);
			return;
		}

		repository.deleteAll(oldDrafts);
		log.info("TDS refund draft cleanup: deleted {} DRAFT TDS refunds older than {}",
				oldDrafts.size(), cutoff);
	}

}
