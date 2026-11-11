package com.taxedge.dashboards.agents.itr.service;

import com.taxedge.dashboards.agents.gst.dto.AssignAgentRequest;

public interface ItrAgentAssignmentService {

    String assignItrApplication(AssignAgentRequest request);

    void assignTdsRefund(AssignAgentRequest request);

    void assignItrFiling(AssignAgentRequest request);

    void assignRevisedItr(AssignAgentRequest request);
}
