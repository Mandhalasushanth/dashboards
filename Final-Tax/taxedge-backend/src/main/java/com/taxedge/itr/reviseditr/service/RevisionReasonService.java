package com.taxedge.itr.reviseditr.service;

import com.taxedge.itr.reviseditr.dto.RevisionReasonDto;

public interface RevisionReasonService {

	String createRevisionReason(RevisionReasonDto dto);

	RevisionReasonDto getRevisionReason(String revisionReasonId);

	String updateRevisionReason(String revisionReasonId, RevisionReasonDto dto);
}
