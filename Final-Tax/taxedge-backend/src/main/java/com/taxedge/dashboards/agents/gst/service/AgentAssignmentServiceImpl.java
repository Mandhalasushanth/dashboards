package com.taxedge.dashboards.agents.gst.service;

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
import com.taxedge.gst.amendment.entity.AdditionalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.BankAccountAmendmentEntity;
import com.taxedge.gst.amendment.entity.ContactAmendmentEntity;
import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.amendment.entity.PrincipalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.SignatoryAmendmentEntity;
import com.taxedge.gst.amendment.repository.AdditionalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.BankAccountAmendmentRepository;
import com.taxedge.gst.amendment.repository.ContactAmendmentRepository;
import com.taxedge.gst.amendment.repository.LegalNameAmendmentRepository;
import com.taxedge.gst.amendment.repository.PrincipalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.SignatoryAmendmentRepository;
import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.gst.compliance.repository.GstComplianceRepository;
import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.repository.GstFilingRepository;
import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.repository.BusinessRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentAssignmentServiceImpl implements AgentAssignmentService {

    private final BusinessRepository businessRepository;
    private final GstFilingRepository gstFilingRepository;
    private final GstComplianceRepository gstComplianceRepository;
    private final AdditionalPlaceAmendmentRepository additionalPlaceAmendmentRepository;
    private final BankAccountAmendmentRepository bankAccountAmendmentRepository;
    private final ContactAmendmentRepository contactAmendmentRepository;
    private final LegalNameAmendmentRepository legalNameAmendmentRepository;
    private final PrincipalPlaceAmendmentRepository principalPlaceAmendmentRepository;
    private final SignatoryAmendmentRepository signatoryAmendmentRepository;
    private final AgentLoginRepository agentLoginRepository;
    private final CaManagerBucketService caManagerBucketService;

    @Override
    @Transactional
    public String assignGstApplication(AssignAgentRequest request) {
        String id = request.getApplicationId();
        Long agentId = request.getAgentId();
        String applicationType = request.getApplicationType();
        log.info("Assigning application [{}] of type [{}] to agent [{}]", id, applicationType, agentId);

        return switch (applicationType) {
            case "GST_REGISTRATION" -> {
                assignGstRegistration(request);
                yield "GST registration successfully assigned to agent.";
            }
            case "GST_FILING" -> {
                assignGstFiling(request);
                yield "GST filing successfully assigned to agent.";
            }
            case "GST_COMPLIANCE" -> {
                assignGstCompliance(request);
                yield "GST compliance successfully assigned to agent.";
            }
            case "ADDITIONAL_PLACE_AMENDMENT" -> {
                assignAdditionalPlaceAmendment(request);
                yield "Additional place amendment successfully assigned to agent.";
            }
            case "BANK_ACCOUNT_AMENDMENT" -> {
                assignBankAccountAmendment(request);
                yield "Bank account amendment successfully assigned to agent.";
            }
            case "CONTACT_AMENDMENT" -> {
                assignContactAmendment(request);
                yield "Contact amendment successfully assigned to agent.";
            }
            case "LEGAL_NAME_AMENDMENT" -> {
                assignLegalNameAmendment(request);
                yield "Legal name amendment successfully assigned to agent.";
            }
            case "PRINCIPAL_PLACE_AMENDMENT" -> {
                assignPrincipalPlaceAmendment(request);
                yield "Principal place amendment successfully assigned to agent.";
            }
            case "SIGNATORY_AMENDMENT" -> {
                assignSignatoryAmendment(request);
                yield "Signatory amendment successfully assigned to agent.";
            }
            default -> throw new ResourceNotFoundException("Application not found across supported services with ID: " + id);
        };
    }

    @Override
    @Transactional
    public void assignGstRegistration(AssignAgentRequest request) {
        String businessGstId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning GST registration [{}] to agent [{}]", businessGstId, agentId);

        Business business = businessRepository.findById(businessGstId)
                .orElseThrow(() -> new ResourceNotFoundException("GST registration not found with ID: " + businessGstId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        business.setAssignedAgent(agent);
        businessRepository.save(business);
        syncBucketItem(request);

        log.info("Successfully assigned GST registration [{}] to agent ID [{}] ({})",
                businessGstId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignGstFiling(AssignAgentRequest request) {
        String gstfilingId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning GST filing [{}] to agent [{}]", gstfilingId, agentId);

        GstFiling gstFiling = gstFilingRepository.findById(gstfilingId)
                .orElseThrow(() -> new ResourceNotFoundException("GST filing not found with ID: " + gstfilingId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        gstFiling.setAssignedAgent(agent);
        gstFilingRepository.save(gstFiling);
        syncBucketItem(request);

        log.info("Successfully assigned GST filing [{}] to agent ID [{}] ({})",
                gstfilingId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignGstCompliance(AssignAgentRequest request) {
        String complianceId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning GST compliance [{}] to agent [{}]", complianceId, agentId);

        GstCompliance compliance = gstComplianceRepository.findById(complianceId)
                .orElseThrow(() -> new ResourceNotFoundException("GST compliance not found with ID: " + complianceId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        compliance.setAssignedAgent(agent);
        gstComplianceRepository.save(compliance);
        syncBucketItem(request);

        log.info("Successfully assigned GST compliance [{}] to agent ID [{}] ({})",
                complianceId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignAdditionalPlaceAmendment(AssignAgentRequest request) {
        String amendmentId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning additional place amendment [{}] to agent [{}]", amendmentId, agentId);

        AdditionalPlaceAmendmentEntity amendment = additionalPlaceAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Additional place amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        additionalPlaceAmendmentRepository.save(amendment);
        syncBucketItem(request);

        log.info("Successfully assigned additional place amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignBankAccountAmendment(AssignAgentRequest request) {
        String amendmentId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning bank account amendment [{}] to agent [{}]", amendmentId, agentId);

        BankAccountAmendmentEntity amendment = bankAccountAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        bankAccountAmendmentRepository.save(amendment);
        syncBucketItem(request);

        log.info("Successfully assigned bank account amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignContactAmendment(AssignAgentRequest request) {
        String amendmentId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning contact amendment [{}] to agent [{}]", amendmentId, agentId);

        ContactAmendmentEntity amendment = contactAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        contactAmendmentRepository.save(amendment);
        syncBucketItem(request);

        log.info("Successfully assigned contact amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignLegalNameAmendment(AssignAgentRequest request) {
        String amendmentId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning legal name amendment [{}] to agent [{}]", amendmentId, agentId);

        LegalNameAmendmentEntity amendment = legalNameAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Legal name amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        legalNameAmendmentRepository.save(amendment);
        syncBucketItem(request);

        log.info("Successfully assigned legal name amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignPrincipalPlaceAmendment(AssignAgentRequest request) {
        String amendmentId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning principal place amendment [{}] to agent [{}]", amendmentId, agentId);

        PrincipalPlaceAmendmentEntity amendment = principalPlaceAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Principal place amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        principalPlaceAmendmentRepository.save(amendment);
        syncBucketItem(request);

        log.info("Successfully assigned principal place amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
    }

    @Override
    @Transactional
    public void assignSignatoryAmendment(AssignAgentRequest request) {
        String amendmentId = request.getApplicationId();
        Long agentId = request.getAgentId();
        log.info("Assigning signatory amendment [{}] to agent [{}]", amendmentId, agentId);

        SignatoryAmendmentEntity amendment = signatoryAmendmentRepository.findById(amendmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Signatory amendment not found with ID: " + amendmentId));

        AgentLogin agent = agentLoginRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with ID: " + agentId));

        amendment.setAssignedAgent(agent);
        signatoryAmendmentRepository.save(amendment);
        syncBucketItem(request);

        log.info("Successfully assigned signatory amendment [{}] to agent ID [{}] ({})",
                amendmentId, agent.getId(), agent.getFullName());
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
