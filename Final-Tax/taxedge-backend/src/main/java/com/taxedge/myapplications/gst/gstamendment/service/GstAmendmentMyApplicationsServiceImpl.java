package com.taxedge.myapplications.gst.gstamendment.service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.gst.amendment.repository.AdditionalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.BankAccountAmendmentRepository;
import com.taxedge.gst.amendment.repository.ContactAmendmentRepository;
import com.taxedge.gst.amendment.repository.LegalNameAmendmentRepository;
import com.taxedge.gst.amendment.repository.PrincipalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.SignatoryAmendmentRepository;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.myapplications.gst.gstamendment.dto.GstAmendmentMyApplicationResponseDto;
import com.taxedge.myapplications.gst.gstamendment.mapper.GstAmendmentMyApplicationsMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GstAmendmentMyApplicationsServiceImpl implements GstAmendmentMyApplicationsService {

    private final LegalNameAmendmentRepository legalNameRepo;
    private final PrincipalPlaceAmendmentRepository principalPlaceRepo;
    private final AdditionalPlaceAmendmentRepository additionalPlaceRepo;
    private final BankAccountAmendmentRepository bankAccountRepo;
    private final SignatoryAmendmentRepository signatoryRepo;
    private final ContactAmendmentRepository contactRepo;
    private final GstAmendmentMyApplicationsMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<GstAmendmentMyApplicationResponseDto> getMyAmendmentApplications(String custId) {
        if (!StringUtils.hasText(custId)) {
            log.warn("getMyAmendmentApplications called with empty custId");
            return Collections.emptyList();
        }

        Stream<GstAmendmentMyApplicationResponseDto> legalNames = legalNameRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(mapper::toDto);

        Stream<GstAmendmentMyApplicationResponseDto> principalPlaces = principalPlaceRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(mapper::toDto);

        Stream<GstAmendmentMyApplicationResponseDto> additionalPlaces = additionalPlaceRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(mapper::toDto);

        Stream<GstAmendmentMyApplicationResponseDto> bankAccounts = bankAccountRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(mapper::toDto);

        Stream<GstAmendmentMyApplicationResponseDto> signatories = signatoryRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(mapper::toDto);

        Stream<GstAmendmentMyApplicationResponseDto> contacts = contactRepo.findByCustomerCustId(custId).stream()
                .filter(e -> e.getStatus() != RegisterationStatus.DRAFT)
                .map(mapper::toDto);

        return Stream.of(legalNames, principalPlaces, additionalPlaces, bankAccounts, signatories, contacts)
                .flatMap(s -> s)
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .toList();
    }
}
