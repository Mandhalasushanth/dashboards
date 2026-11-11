package com.taxedge.dashboards.camanagers.bucket.helper;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.dashboards.auth.entity.ManagerLogin;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;
import com.taxedge.dashboards.auth.repository.ManagerLoginRepository;
import com.taxedge.dashboards.camanagers.bucket.dto.UpdateBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.entity.CaManagerBucketItem;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketStage;
import com.taxedge.gst.registration.repository.BusinessRepository;
import com.taxedge.itr.filing.repository.ItrFilingRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CaManagerBucketHelper {

    private final ManagerLoginRepository managerLoginRepository;
    private final AgentLoginRepository agentLoginRepository;
    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;
    private final CompanyDetailsRepository companyDetailsRepository;
    private final ItrFilingRepository itrFilingRepository;

    /**
     * Resolves the manager ID from explicit parameter or from current authentication context.
     */
    public Long resolveCurrentManagerId(Long explicitManagerId) {
        if (explicitManagerId != null && explicitManagerId > 0) {
            return explicitManagerId;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        String name = auth.getName().replace("MANAGER:", "").trim();
        try {
            return Long.parseLong(name);
        } catch (NumberFormatException e) {
            return managerLoginRepository.findByEmailIgnoreCase(name)
                    .map(ManagerLogin::getId)
                    .orElse(null);
        }
    }

    /**
     * Finds ManagerLogin entity by id.
     */
    public ManagerLogin findManager(Long managerId) {
        return managerId != null ? managerLoginRepository.findById(managerId).orElse(null) : null;
    }

    /**
     * Attaches customer relationship from explicit custId or from the application domain record.
     */
    public void enrichCustomerRelation(CaManagerBucketItem item, String explicitCustId) {
        if (explicitCustId != null && !explicitCustId.isBlank()) {
            customerRepository.findById(explicitCustId).ifPresent(item::setCustomer);
        }

        if (item.getCustomer() != null || item.getApplicationCategory() == null) {
            return;
        }

        switch (item.getApplicationCategory()) {
            case GST -> businessRepository.findById(item.getApplicationId()).ifPresent(b -> item.setCustomer(b.getCustomer()));
            case COMPANY -> companyDetailsRepository.findById(item.getApplicationId()).ifPresent(c -> item.setCustomer(c.getCustomer()));
            case ITR -> itrFilingRepository.findById(item.getApplicationId()).ifPresent(i -> item.setCustomer(i.getCustomer()));
        }
    }

    /**
     * Applies updates (agent, stage, priority, notes, dueDate) to bucket item.
     */
    public void applyUpdates(CaManagerBucketItem item, UpdateBucketRequestDto request) {
        Optional.ofNullable(request.getAgentId())
                .flatMap(agentLoginRepository::findById)
                .ifPresent(agent -> {
                    item.setAssignedAgent(agent);
                    item.setBucketStage(BucketStage.ASSIGNED);
                });

        Optional.ofNullable(request.getStage()).ifPresent(item::setBucketStage);
        Optional.ofNullable(request.getPriority()).ifPresent(item::setPriority);
        Optional.ofNullable(request.getNotes()).ifPresent(item::setNotes);
        Optional.ofNullable(request.getDueDate()).ifPresent(item::setDueDate);
    }
}
