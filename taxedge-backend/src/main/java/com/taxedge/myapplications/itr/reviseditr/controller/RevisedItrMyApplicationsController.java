package com.taxedge.myapplications.itr.reviseditr.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.myapplications.itr.reviseditr.dto.RevisedItrMyApplicationResponseDto;
import com.taxedge.myapplications.itr.reviseditr.service.RevisedItrMyApplicationsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/my-applications/revised-itr")
@RequiredArgsConstructor
@Slf4j
public class RevisedItrMyApplicationsController {

    private final RevisedItrMyApplicationsService revisedItrMyApplicationsService;

    @GetMapping("/{custId}")
    public ResponseEntity<List<RevisedItrMyApplicationResponseDto>> getMyRevisedApplications(
            @PathVariable("custId") String pathCustId,
            @RequestHeader(value = "X-Customer-Id", required = false) String headerCustId) {
        String effectiveCustId = (headerCustId != null && !headerCustId.isBlank()) ? headerCustId : pathCustId;
        log.info("Fetching Revised ITR applications for customer: {}", effectiveCustId);
        List<RevisedItrMyApplicationResponseDto> applications = revisedItrMyApplicationsService.getMyRevisedItrApplications(effectiveCustId);
        return ResponseEntity.ok(applications);
    }
}
