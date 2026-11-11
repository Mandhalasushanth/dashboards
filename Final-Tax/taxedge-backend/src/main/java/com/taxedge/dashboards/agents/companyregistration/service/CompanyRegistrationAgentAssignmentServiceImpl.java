package com.taxedge.dashboards.agents.companyregistration.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.dashboards.agents.gst.dto.AssignAgentRequest;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;
import com.taxedge.dashboards.camanagers.bucket.dto.UpdateBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketPriority;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketStage;
import com.taxedge.dashboards.camanagers.bucket.service.CaManagerBucketService;
import com.taxedge.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyRegistrationAgentAssignmentServiceImpl implements CompanyRegistrationAgentAssignmentService {

    private final CompanyDetailsRepository companyDetailsRepository;
    private final AgentLoginRepository agentLoginRepository;
    private final CaManagerBucketService caManagerBucketService;

    @Override
    @Transactional
    public String assignCompanyApplication(AssignAgentRequest request) {
        String id = request.getApplicationId();
        Long agentId = request.getAgentId();
        String applicationType = request.getApplicationType();
        log.info("Assigning company application [{}] of type [{}] to agent [{}]", id, applicationType, agentId);

        return switch (applicationType) {
            case "COMPANY_REGISTRATION" -> {
                assignCompanyRegistration(request);
                yield "Company registration successfully assigned to agent.";
            }
            default -> throw new ResourceNotFoundException("Company application not found across supported services with ID: " + id);
        };
    }

    @Override
    @Transactional
    public void assignCompanyRegistration(AssignAgentRequest request) {
        String companyRegistrationId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning company registration [{}] to agent [{}]", companyRegistrationId, agentId);

        CompanyDetails company = companyDetailsRepository.findById(companyRegistrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Company registration not found with ID: " + companyRegistrationId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        company.setAssignedAgent(agent);
        companyDetailsRepository.save(company);
        syncBucketItem(request);

        log.info("Successfully assigned company registration [{}] to agent ID [{}] ({})",
                companyRegistrationId, agent.getId(), agent.getFullName());
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
