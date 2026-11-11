package com.taxedge.itr.reviseditr.service;

import com.taxedge.itr.reviseditr.dto.RevisedItrDetailsDto;

public interface RevisedItrDetailsService {

	String createRevisedItrDetails(RevisedItrDetailsDto dto);

	String updateRevisedItrDetails(String detailsId, RevisedItrDetailsDto dto);

	RevisedItrDetailsDto getRevisedItrDetails(String detailsId);
}
