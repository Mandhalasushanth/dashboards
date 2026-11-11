package com.taxedge.myapplications.itr.itrfiling.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.myapplications.itr.itrfiling.dto.ItrFilingMyApplicationResponseDto;
import com.taxedge.myapplications.itr.itrfiling.service.ItrFilingMyApplicationsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/my-applications/itr-filing")
@RequiredArgsConstructor
@Slf4j
public class ItrFilingMyApplicationsController {

    private final ItrFilingMyApplicationsService itrFilingMyApplicationsService;

    @GetMapping("/{custId}")
    public ResponseEntity<List<ItrFilingMyApplicationResponseDto>> getMyApplications(
            @PathVariable("custId") String pathCustId,
            @RequestHeader(value = "X-Customer-Id", required = false) String headerCustId) {
        String effectiveCustId = (headerCustId != null && !headerCustId.isBlank()) ? headerCustId : pathCustId;
        log.info("Fetching ITR Filing applications for customer: {}", effectiveCustId);
        List<ItrFilingMyApplicationResponseDto> applications = itrFilingMyApplicationsService.getMyItrFilingApplications(effectiveCustId);
        return ResponseEntity.ok(applications);
    }
}
