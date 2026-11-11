package com.taxedge.itr.filing.service;

import com.taxedge.itr.filing.dto.ItrFilingPostDto;
import com.taxedge.itr.filing.entity.ItrFiling;

public interface ItrFilingService {

    String createItrFiling(ItrFilingPostDto dto);

    String updateItrFiling(String itrId, ItrFilingPostDto dto);

    ItrFiling getItrFiling(String itrId);

    String submitItrFiling(String itrId, String pushToken);
}
