package com.taxedge.dashboards.agents.gst.service;

import com.taxedge.dashboards.agents.gst.dto.AssignAgentRequest;

public interface AgentAssignmentService {

    String assignGstApplication(AssignAgentRequest request);

    void assignGstRegistration(AssignAgentRequest request);

    void assignGstFiling(AssignAgentRequest request);

    void assignGstCompliance(AssignAgentRequest request);

    void assignAdditionalPlaceAmendment(AssignAgentRequest request);

    void assignBankAccountAmendment(AssignAgentRequest request);

    void assignContactAmendment(AssignAgentRequest request);

    void assignLegalNameAmendment(AssignAgentRequest request);

    void assignPrincipalPlaceAmendment(AssignAgentRequest request);

    void assignSignatoryAmendment(AssignAgentRequest request);
}
