package com.taxedge.dashboards.camanagers.companyregistration.mapper;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.entity.DocumentsKycChecklist;
import com.taxedge.companyregistration.entity.PromoterDirectorDetails;
import com.taxedge.companyregistration.entity.RegisteredOfficeDetails;
import com.taxedge.companyregistration.entity.ShareholdingCapital;
import com.taxedge.companyregistration.entity.ShareholdingPattern;
import com.taxedge.companyregistration.repository.DocumentsKycChecklistRepository;
import com.taxedge.companyregistration.repository.PromoterDirectorDetailsRepository;
import com.taxedge.companyregistration.repository.RegisteredOfficeDetailsRepository;
import com.taxedge.companyregistration.repository.ShareholdingCapitalRepository;
import com.taxedge.companyregistration.repository.ShareholdingPatternRepository;
import com.taxedge.dashboards.camanagers.companyregistration.dto.CompanyRegistrationDetailsDto;

import lombok.RequiredArgsConstructor;

/**
 * Builds the dashboard DTO for a list of registrations. Each related table is read once for the whole list
 * (not once per company), then matched back to its registration. Shared by the CA manager and agent
 * dashboards so both show the same record.
 */
@Component
@RequiredArgsConstructor
public class CompanyRegistrationDetailsAssembler {

    private final CompanyRegistrationDetailsMapper mapper;
    private final RegisteredOfficeDetailsRepository registeredOfficeDetailsRepository;
    private final PromoterDirectorDetailsRepository promoterDirectorDetailsRepository;
    private final ShareholdingCapitalRepository shareholdingCapitalRepository;
    private final ShareholdingPatternRepository shareholdingPatternRepository;
    private final DocumentsKycChecklistRepository documentsKycChecklistRepository;

    /** Call inside a read-only transaction: documents and lazy links are read while the session is open. */
    public List<CompanyRegistrationDetailsDto> toDetails(List<CompanyDetails> companies) {
        if (companies == null || companies.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> ids = companies.stream().map(CompanyDetails::getCompanyRegistrationId).toList();

        Map<String, RegisteredOfficeDetails> offices = byCompany(
                registeredOfficeDetailsRepository.findByCompanyDetails_CompanyRegistrationIdIn(ids),
                office -> office.getCompanyDetails().getCompanyRegistrationId());
        Map<String, List<PromoterDirectorDetails>> directors = promoterDirectorDetailsRepository
                .findByCompanyDetails_CompanyRegistrationIdIn(ids).stream()
                .collect(Collectors.groupingBy(director -> director.getCompanyDetails().getCompanyRegistrationId()));
        Map<String, ShareholdingCapital> capitals = byCompany(
                shareholdingCapitalRepository.findByCompanyDetails_CompanyRegistrationIdIn(ids),
                capital -> capital.getCompanyDetails().getCompanyRegistrationId());
        Map<String, List<ShareholdingPattern>> patterns = shareholdingPatternRepository
                .findAllWithDirectorByCompanyIds(ids).stream()
                .collect(Collectors.groupingBy(pattern -> pattern.getCompanyDetails().getCompanyRegistrationId()));
        Map<String, DocumentsKycChecklist> documents = byCompany(
                documentsKycChecklistRepository.findByCompanyDetails_CompanyRegistrationIdIn(ids),
                checklist -> checklist.getCompanyDetails().getCompanyRegistrationId());

        return companies.stream().map(company -> {
            String id = company.getCompanyRegistrationId();
            CompanyRegistrationDetailsDto dto = mapper.toDto(company);
            RegisteredOfficeDetails office = offices.get(id);
            dto.setRegisteredOffice(office == null ? null : mapper.toRegisteredOffice(office));
            dto.setDirectors(mapper.toDirectors(directors.getOrDefault(id, List.of())));
            ShareholdingCapital capital = capitals.get(id);
            dto.setShareholdingCapital(capital == null ? null : mapper.toCapital(capital));
            dto.setShareholdingPattern(mapper.toShareAllocations(patterns.getOrDefault(id, List.of())));
            attachDocuments(dto, documents.get(id));
            return dto;
        }).toList();
    }

    private static void attachDocuments(CompanyRegistrationDetailsDto dto, DocumentsKycChecklist checklist) {
        if (checklist == null) {
            return;
        }
        dto.setDocumentId(checklist.getDocumentId());
        dto.setPanCard(checklist.getPanCard());
        dto.setIdentityAddressProof(checklist.getIdentityAddressProof());
        dto.setPassportPhoto(checklist.getPassportPhoto());
        dto.setOfficeAddressProof(checklist.getOfficeAddressProof());
        dto.setOfficeUtilityBill(checklist.getOfficeUtilityBill());
        dto.setOwnerNoc(checklist.getOwnerNoc());
        dto.setStatutoryDocuments(checklist.getStatutoryDocuments());
        dto.setAoaEAoa(checklist.getAoaEAoa());
    }

    /** One record per registration (the newest wins if a table ever holds two). */
    private static <T> Map<String, T> byCompany(List<T> rows, Function<T, String> companyId) {
        return rows.stream().collect(Collectors.toMap(companyId, Function.identity(), (first, second) -> second));
    }
}
