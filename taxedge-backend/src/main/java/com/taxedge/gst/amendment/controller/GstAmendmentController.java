package com.taxedge.gst.amendment.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.amendment.dto.*;
import com.taxedge.gst.amendment.service.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/gst/amendment")
@RequiredArgsConstructor
public class GstAmendmentController {

    private final AdditionalPlaceAmendmentService additionalPlaceService;
    private final BankAccountAmendmentService bankAccountService;
    private final ContactAmendmentService contactService;
    private final LegalNameAmendmentService legalNameService;
    private final PrincipalPlaceAmendmentService principalPlaceService;
    private final SignatoryAmendmentService signatoryService;

    // ==========================================
    // 1. Legal Name Amendment
    // ==========================================

    @GetMapping("/legal-name/{gstId}/existing")
    public ResponseEntity<LegalNameAmendmentViewDto> getExistingLegalNameDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(legalNameService.getExistingLegalNameDetails(gstId));
    }

    @PostMapping("/legal-name/{gstId}")
    public ResponseEntity<LegalNameAmendmentViewDto> submitLegalNameAmendment(
            @PathVariable String gstId,
            @ModelAttribute LegalNameAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        LegalNameAmendmentViewDto result = legalNameService.submitLegalNameAmendment(
                gstId, dto.getCustomerId(), dto.getNewLegalName(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/legal-name/record/{id}")
    public ResponseEntity<LegalNameAmendmentViewDto> getLegalNameAmendmentById(@PathVariable String id) {
        return ResponseEntity.ok(legalNameService.getAmendmentById(id));
    }

    @PutMapping("/legal-name/record/{id}")
    public ResponseEntity<LegalNameAmendmentViewDto> updateLegalNameAmendment(
            @PathVariable String id,
            @ModelAttribute LegalNameAmendmentViewDto dto,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        LegalNameAmendmentViewDto result = legalNameService.updateLegalNameAmendment(id, dto.getNewLegalName(), file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/legal-name/submit")
    public ResponseEntity<String> submitLegalNameAmendment(
            @RequestParam(required = false) String gstId,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String pushToken) {
        return ResponseEntity.ok(legalNameService.submitAmendment(id, gstId, pushToken));
    }

    // ==========================================
    // 2. Principal Place Amendment
    // ==========================================

    @GetMapping("/principal-place/{gstId}/existing")
    public ResponseEntity<PrincipalPlaceAmendmentViewDto> getExistingPrincipalPlaceDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(principalPlaceService.getExistingPrincipalPlaceDetails(gstId));
    }

    @PostMapping("/principal-place/{gstId}")
    public ResponseEntity<PrincipalPlaceAmendmentViewDto> submitPrincipalPlaceAmendment(
            @PathVariable String gstId,
            @ModelAttribute PrincipalPlaceAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        PrincipalPlaceAmendmentViewDto result = principalPlaceService.submitAmendment(
                gstId, dto.getCustomerId(), dto.getNewBusinessAddress(), dto.getNewCity(), dto.getNewDistrict(),
                dto.getNewState(), dto.getNewPinCode(), dto.getNatureOfPremises(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/principal-place/record/{id}")
    public ResponseEntity<PrincipalPlaceAmendmentViewDto> getPrincipalPlaceAmendmentById(@PathVariable String id) {
        return ResponseEntity.ok(principalPlaceService.getAmendmentById(id));
    }

    @PutMapping("/principal-place/record/{id}")
    public ResponseEntity<PrincipalPlaceAmendmentViewDto> updatePrincipalPlaceAmendment(
            @PathVariable String id,
            @ModelAttribute PrincipalPlaceAmendmentViewDto dto,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        PrincipalPlaceAmendmentViewDto result = principalPlaceService.updateAmendment(
                id, dto.getNewBusinessAddress(), dto.getNewCity(), dto.getNewDistrict(),
                dto.getNewState(), dto.getNewPinCode(), dto.getNatureOfPremises(), file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/principal-place/submit")
    public ResponseEntity<String> submitPrincipalPlaceAmendment(
            @RequestParam(required = false) String gstId,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String pushToken) {
        return ResponseEntity.ok(principalPlaceService.submitAmendment(id, gstId, pushToken));
    }

    // ==========================================
    // 3. Additional Place Amendment
    // ==========================================

    @GetMapping("/additional-place/{gstId}/existing")
    public ResponseEntity<List<AdditionalPlaceAmendmentViewDto>> getExistingAdditionalPlaces(@PathVariable String gstId) {
        return ResponseEntity.ok(additionalPlaceService.getExistingAdditionalPlaces(gstId));
    }

    @PostMapping("/additional-place/{gstId}")
    public ResponseEntity<AdditionalPlaceAmendmentViewDto> submitNewAdditionalPlace(
            @PathVariable String gstId,
            @ModelAttribute AdditionalPlaceAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        AdditionalPlaceAmendmentViewDto result = additionalPlaceService.submitAdditionalPlace(
                gstId, dto.getCustomerId(), dto.getAddress(), dto.getCity(), dto.getPinCode(), dto.getNatureOfPremises(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/additional-place/record/{id}")
    public ResponseEntity<AdditionalPlaceAmendmentViewDto> getAdditionalPlaceAmendmentById(@PathVariable String id) {
        return ResponseEntity.ok(additionalPlaceService.getAmendmentById(id));
    }

    @PutMapping("/additional-place/record/{id}")
    public ResponseEntity<AdditionalPlaceAmendmentViewDto> updateAdditionalPlaceAmendment(
            @PathVariable String id,
            @ModelAttribute AdditionalPlaceAmendmentViewDto dto,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        AdditionalPlaceAmendmentViewDto result = additionalPlaceService.updateAdditionalPlace(
                id, dto.getAddress(), dto.getCity(), dto.getPinCode(), dto.getNatureOfPremises(), file);
        return ResponseEntity.ok(result);
    }

    @PostMapping({"/additional-place/submit", "/submit"})
    public ResponseEntity<String> submitAdditionalPlaceAmendment(
            @RequestParam(required = false) String gstId,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String pushToken) {
        return ResponseEntity.ok(additionalPlaceService.submitAmendment(id, gstId, pushToken));
    }

    // ==========================================
    // 4. Bank Account Amendment
    // ==========================================

    @GetMapping("/bank-account/{gstId}/existing")
    public ResponseEntity<BankAccountAmendmentViewDto> getExistingBankAccountDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(bankAccountService.getExistingBankAccountDetails(gstId));
    }

    @PostMapping("/bank-account/{gstId}")
    public ResponseEntity<BankAccountAmendmentViewDto> submitBankAccountAmendment(
            @PathVariable String gstId,
            @ModelAttribute BankAccountAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        BankAccountAmendmentViewDto result = bankAccountService.submitBankAccountAmendment(
                gstId, dto.getCustomerId(), dto.getNewBankName(), dto.getNewBankAccountNumber(),
                dto.getNewIfscCode(), dto.getNewAccountType(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/bank-account/record/{id}")
    public ResponseEntity<BankAccountAmendmentViewDto> getBankAccountAmendmentById(@PathVariable String id) {
        return ResponseEntity.ok(bankAccountService.getAmendmentById(id));
    }

    @PutMapping("/bank-account/record/{id}")
    public ResponseEntity<BankAccountAmendmentViewDto> updateBankAccountAmendment(
            @PathVariable String id,
            @ModelAttribute BankAccountAmendmentViewDto dto,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        BankAccountAmendmentViewDto result = bankAccountService.updateBankAccountAmendment(
                id, dto.getNewBankName(), dto.getNewBankAccountNumber(),
                dto.getNewIfscCode(), dto.getNewAccountType(), file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/bank-account/submit")
    public ResponseEntity<String> submitBankAccountAmendment(
            @RequestParam(required = false) String gstId,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String pushToken) {
        return ResponseEntity.ok(bankAccountService.submitAmendment(id, gstId, pushToken));
    }

    // ==========================================
    // 5. Contact Amendment
    // ==========================================

    @GetMapping("/contact/{gstId}/existing")
    public ResponseEntity<ContactAmendmentViewDto> getExistingContactDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(contactService.getExistingContactDetails(gstId));
    }

    @PostMapping("/contact/{gstId}")
    public ResponseEntity<ContactAmendmentViewDto> submitContactAmendment(
            @PathVariable String gstId,
            @ModelAttribute ContactAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        ContactAmendmentViewDto result = contactService.submitContactAmendment(
                gstId, dto.getCustomerId(), dto.getNewMobileNumber(), dto.getNewEmail(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/contact/record/{id}")
    public ResponseEntity<ContactAmendmentViewDto> getContactAmendmentById(@PathVariable String id) {
        return ResponseEntity.ok(contactService.getAmendmentById(id));
    }

    @PutMapping("/contact/record/{id}")
    public ResponseEntity<ContactAmendmentViewDto> updateContactAmendment(
            @PathVariable String id,
            @ModelAttribute ContactAmendmentViewDto dto,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        ContactAmendmentViewDto response = contactService.updateContactAmendment(
                id, dto.getNewMobileNumber(), dto.getNewEmail(), file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/contact/submit")
    public ResponseEntity<String> submitContactAmendment(
            @RequestParam(required = false) String gstId,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String pushToken) {
        return ResponseEntity.ok(contactService.submitAmendment(id, gstId, pushToken));
    }

    // ==========================================
    // 6. Signatory Amendment
    // ==========================================

    @GetMapping("/signatory/{gstId}/existing")
    public ResponseEntity<SignatoryAmendmentViewDto> getExistingSignatoryDetails(@PathVariable String gstId) {
        return ResponseEntity.ok(signatoryService.getExistingSignatoryDetails(gstId));
    }

    @PostMapping("/signatory/{gstId}")
    public ResponseEntity<SignatoryAmendmentViewDto> submitSignatoryAmendment(
            @PathVariable String gstId,
            @ModelAttribute SignatoryAmendmentViewDto dto,
            @RequestParam("file") MultipartFile file) throws IOException {
        SignatoryAmendmentViewDto result = signatoryService.submitSignatoryAmendment(
                gstId, dto.getCustomerId(), dto.getNewSignatoryName(), dto.getNewSignatoryPan(), dto.getNewSignatoryDob(),
                dto.getNewDesignation(), dto.getNewSignatoryMobile(), dto.getNewSignatoryEmail(), file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/signatory/record/{id}")
    public ResponseEntity<SignatoryAmendmentViewDto> getSignatoryAmendmentById(@PathVariable String id) {
        return ResponseEntity.ok(signatoryService.getAmendmentById(id));
    }

    @PutMapping("/signatory/record/{id}")
    public ResponseEntity<SignatoryAmendmentViewDto> updateSignatoryAmendment(
            @PathVariable String id,
            @ModelAttribute SignatoryAmendmentViewDto dto,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        SignatoryAmendmentViewDto result = signatoryService.updateSignatoryAmendment(
                id, dto.getNewSignatoryName(), dto.getNewSignatoryPan(), dto.getNewSignatoryDob(),
                dto.getNewDesignation(), dto.getNewSignatoryMobile(), dto.getNewSignatoryEmail(), file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/signatory/submit")
    public ResponseEntity<String> submitSignatoryAmendment(
            @RequestParam(required = false) String gstId,
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String pushToken) {
        return ResponseEntity.ok(signatoryService.submitAmendment(id, gstId, pushToken));
    }
}
