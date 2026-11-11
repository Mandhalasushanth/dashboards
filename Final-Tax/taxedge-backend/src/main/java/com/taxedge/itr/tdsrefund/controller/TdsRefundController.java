package com.taxedge.itr.tdsrefund.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.itr.tdsrefund.dto.TdsRefundDto;
import com.taxedge.itr.tdsrefund.service.TdsRefundService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tds-refund")
@RequiredArgsConstructor
public class TdsRefundController {

    private final TdsRefundService service;
    

    @PostMapping("/save")
    public ResponseEntity<String> saveBankAccount(@Valid @RequestBody TdsRefundDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.saveTds(dto));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateBankAccount(@PathVariable String id,
                                                    @Valid @RequestBody TdsRefundDto dto) {
        return ResponseEntity.ok(service.updateTds(id, dto));
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitTdsRefund(
            @RequestParam String id,
            @RequestParam(required = false) String pushToken) {
        return ResponseEntity.ok(service.submitTdsRefund(id, pushToken));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<TdsRefundDto> getBankAccount(@PathVariable String id) {
        return ResponseEntity.ok(service.getTds(id));
    }

    @GetMapping("/get-by-customer/{custId}")
    public ResponseEntity<TdsRefundDto> getBankAccountByCustId(@PathVariable String custId) {
        return ResponseEntity.ok(service.getTdsByCustId(custId));
    }
}
