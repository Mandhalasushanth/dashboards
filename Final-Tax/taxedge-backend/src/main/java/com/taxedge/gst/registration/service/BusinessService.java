package com.taxedge.gst.registration.service;

import com.taxedge.gst.registration.dto.BusinessRequest;
import com.taxedge.gst.registration.dto.BusinessResponse;
import com.taxedge.gst.registration.dto.BusinessUpdateRequest;

public interface BusinessService {

	String registerBusiness(BusinessRequest businessRequest);

	BusinessResponse getBusiness(String gstId);

	String updateBusiness(String gstId, BusinessUpdateRequest businessUpdateRequest);

	String deleteBusiness(String gstId);

	String submitRegistration(String gstId, String pushToken);
}
