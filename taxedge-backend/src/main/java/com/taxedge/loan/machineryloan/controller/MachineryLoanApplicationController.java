package com.taxedge.loan.machineryloan.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.machineryloan.dto.MachineryLoanApplicationDto;
import com.taxedge.loan.machineryloan.dto.MachineryLoanDocumentDto;
import com.taxedge.loan.machineryloan.service.MachineryLoanApplicationService;
import com.taxedge.loan.machineryloan.service.MachineryLoanDocumentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/loan/machinery")
@RequiredArgsConstructor
public class MachineryLoanApplicationController {

    private final MachineryLoanApplicationService service;
    
    private final MachineryLoanDocumentService docservice;

    @PostMapping("/save")
    public ResponseEntity<String> save(@RequestBody MachineryLoanApplicationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.saveApplication(dto));
    }

    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MachineryLoanApplicationDto> submit(
            @Valid @RequestPart("application") MachineryLoanApplicationDto dto,
            @RequestPart("machineryQuotationFile") MultipartFile machineryQuotationFile) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.submitApplication(dto, machineryQuotationFile));
    }

    @DeleteMapping("/{machineryLoanId}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String machineryLoanId) {
        service.deleteApplication(machineryLoanId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update/{machineryLoanId}")
    public ResponseEntity<String> update(@PathVariable String machineryLoanId,
                                         @RequestBody MachineryLoanApplicationDto dto) {
        return ResponseEntity.ok(service.updateApplication(machineryLoanId, dto));
    }

    @GetMapping("/{machineryLoanId}")
    public ResponseEntity<MachineryLoanApplicationDto> get(
            @PathVariable String machineryLoanId) {
        return ResponseEntity.ok(service.getApplication(machineryLoanId));
    }

    @GetMapping
    public ResponseEntity<List<MachineryLoanApplicationDto>> list() {
        return ResponseEntity.ok(service.getApplications());
    }
    
    
    
    @PostMapping("/documents/save/{machineryLoanId}")
    public ResponseEntity<String> save(@PathVariable String machineryLoanId,
                                       @RequestBody MachineryLoanDocumentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(docservice.saveDocuments(machineryLoanId, dto));
    }

    @PutMapping("/documents/update/{machineryLoanId}")
    public ResponseEntity<String> update(@PathVariable String machineryLoanId,
                                         @RequestBody MachineryLoanDocumentDto dto) {
        return ResponseEntity.ok(docservice.updateDocuments(machineryLoanId, dto));
    }

    @DeleteMapping("/documents/{machineryLoanId}")
    public ResponseEntity<Void> deleteDocuments(@PathVariable String machineryLoanId) {
        docservice.deleteDocuments(machineryLoanId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/documents/{machineryLoanId}")
    public ResponseEntity<MachineryLoanDocumentDto> getdoc(
            @PathVariable String machineryLoanId) {
        return ResponseEntity.ok(docservice.getDocuments(machineryLoanId));
    }
    
    
}
