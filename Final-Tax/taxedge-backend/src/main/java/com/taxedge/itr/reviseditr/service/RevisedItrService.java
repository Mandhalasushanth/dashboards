package com.taxedge.itr.reviseditr.service;

import com.taxedge.itr.reviseditr.dto.RevisedItrDto;

public interface RevisedItrService {

	String createRevisedItr(RevisedItrDto dto);

	RevisedItrDto getRevisedItr(String revisedItrId);

	String updateRevisedItr(String revisedItrId, RevisedItrDto dto);
 
	String submitRevisedItr(String revisedItrId, String pushToken);
}
