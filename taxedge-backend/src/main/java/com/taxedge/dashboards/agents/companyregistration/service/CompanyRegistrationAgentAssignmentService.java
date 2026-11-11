package com.taxedge.dashboards.agents.companyregistration.service;

import com.taxedge.dashboards.agents.gst.dto.AssignAgentRequest;

public interface CompanyRegistrationAgentAssignmentService {

    String assignCompanyApplication(AssignAgentRequest request);

    void assignCompanyRegistration(AssignAgentRequest request);
}
