package com.taxedge.itr.tdsrefund.service;

import com.taxedge.itr.tdsrefund.dto.TdsRefundDto;

public interface TdsRefundService {

    String saveTds(TdsRefundDto dto);

    String updateTds(String id, TdsRefundDto dto);
    
    TdsRefundDto getTds(String id);

    TdsRefundDto getTdsByCustId(String custId);

    String submitTdsRefund(String id, String pushToken);
}

