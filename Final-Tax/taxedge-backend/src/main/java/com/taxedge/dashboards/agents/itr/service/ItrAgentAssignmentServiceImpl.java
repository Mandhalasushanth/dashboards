package com.taxedge.dashboards.agents.itr.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.agents.gst.dto.AssignAgentRequest;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;
import com.taxedge.dashboards.camanagers.bucket.dto.UpdateBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketPriority;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketStage;
import com.taxedge.dashboards.camanagers.bucket.service.CaManagerBucketService;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.repository.ItrFilingRepository;
import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;
import com.taxedge.itr.tdsrefund.entity.TdsRefund;
import com.taxedge.itr.tdsrefund.repository.TdsRefundRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItrAgentAssignmentServiceImpl implements ItrAgentAssignmentService {

    private final TdsRefundRepository tdsRefundRepository;
    private final ItrFilingRepository itrFilingRepository;
    private final RevisedItrRepository revisedItrRepository;
    private final AgentLoginRepository agentLoginRepository;
    private final CaManagerBucketService caManagerBucketService;

    @Override
    @Transactional
    public String assignItrApplication(AssignAgentRequest request) {
        String id = request.getApplicationId();
        Long agentId = request.getAgentId();
        String applicationType = request.getApplicationType();
        log.info("Assigning ITR application [{}] of type [{}] to agent [{}]", id, applicationType, agentId);

        return switch (applicationType) {
            case "TDS_REFUND" -> {
                assignTdsRefund(request);
                yield "TDS refund successfully assigned to agent.";
            }
            case "ITR_FILING" -> {
                assignItrFiling(request);
                yield "ITR filing successfully assigned to agent.";
            }
            case "REVISED_ITR" -> {
                assignRevisedItr(request);
                yield "Revised ITR successfully assigned to agent.";
            }
            default -> throw new ResourceNotFoundException("ITR application not found across supported services with ID: " + id);
        };
    }

    @Override
    @Transactional
    public void assignTdsRefund(AssignAgentRequest request) {
        String refundId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning TDS refund [{}] to agent [{}]", refundId, agentId);

        TdsRefund refund = tdsRefundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("TDS refund application not found with ID: " + refundId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        refund.setAssignedAgent(agent);
        tdsRefundRepository.save(refund);
        syncBucketItem(request);

        log.info("Successfully assigned TDS refund [{}] to agent ID [{}] ({})",
                refundId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignItrFiling(AssignAgentRequest request) {
        String itrId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning ITR filing [{}] to agent [{}]", itrId, agentId);

        ItrFiling itrFiling = itrFilingRepository.findById(itrId)
                .orElseThrow(() -> new ResourceNotFoundException("ITR filing application not found with ID: " + itrId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        itrFiling.setAssignedAgent(agent);
        itrFilingRepository.save(itrFiling);
        syncBucketItem(request);

        log.info("Successfully assigned ITR filing [{}] to agent ID [{}] ({})",
                itrId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignRevisedItr(AssignAgentRequest request) {
        String revisedItrId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning Revised ITR [{}] to agent [{}]", revisedItrId, agentId);

        RevisedItr revisedItr = revisedItrRepository.findById(revisedItrId)
                .orElseThrow(() -> new ResourceNotFoundException("Revised ITR application not found with ID: " + revisedItrId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        revisedItr.setAssignedAgent(agent);
        revisedItrRepository.save(revisedItr);
        syncBucketItem(request);

        log.info("Successfully assigned Revised ITR [{}] to agent ID [{}] ({})",
                revisedItrId, agent.getId(), agent.getFullName());
    }

    private void syncBucketItem(AssignAgentRequest request) {
        UpdateBucketRequestDto bucketUpdateRequest = UpdateBucketRequestDto.builder()
                .agentId(request.getAgentId())
                .stage(BucketStage.ASSIGNED)
                .priority(parsePriority(request.getPriority()))
                .notes(request.getNotes())
                .dueDate(request.getDueDate())
                .build();
        try {
            caManagerBucketService.updateBucketItemByApplicationId(request.getApplicationId(), bucketUpdateRequest);
        } catch (Exception ex) {
            log.info("Bucket item not found or could not be updated for application [{}]: {}", request.getApplicationId(), ex.getMessage());
        }
    }

    private BucketPriority parsePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return null;
        }
        try {
            return BucketPriority.valueOf(priority.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
