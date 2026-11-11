package com.taxedge.gst.registration.dto;

import java.time.LocalDate;

import com.taxedge.gst.registration.enums.AccountType;
import com.taxedge.gst.registration.enums.CompositionScheme;
import com.taxedge.gst.registration.enums.ConstitutionOfBusiness;
import com.taxedge.gst.registration.enums.NatureOfBusiness;
import com.taxedge.gst.registration.enums.PlaceOfBusiness;
import com.taxedge.gst.registration.enums.ReasonForRegistration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessRequest {

	@NotBlank
	private String customerId;

	@NotBlank
	private String legalName;

	@NotBlank
	private String tradeName;

	@NotNull
	private ConstitutionOfBusiness constitutionOfBusiness;

	@NotNull
	private NatureOfBusiness natureOfBusiness;

	@NotNull
	private LocalDate dateOfCommencement;

	@NotBlank
	@Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Enter a valid PAN number")
	private String businessPan;

	@NotNull
	private ReasonForRegistration reasonForRegistration;

	@NotNull
	private CompositionScheme compositionScheme;

	@NotNull
	private PlaceOfBusiness placeOfBusiness;

	@NotBlank
	private String businessAddress;

	@NotBlank
	private String city;

	@NotBlank
	private String district;

	@NotBlank
	private String state;

	@NotBlank
	private String pinCode;

	@NotBlank
	private String hsnSac;

	@NotBlank
	private String accountHolderName;

	@NotBlank
	private String bankAccountNumber;

	@NotBlank
	private String ifscCode;

	@NotBlank
	private String bankName;

	@NotBlank
	private String branchName;

	@NotNull
	private AccountType accountType;

	@NotBlank
	private String authorisedSignatory;

	@NotBlank
	private String signatoryName;

	@NotBlank
	private String signatoryPan;

	@NotNull
	private LocalDate signatoryDob;

	@NotBlank
	private String designation;

	@NotBlank
	private String signatoryMobile;

	@NotBlank
	@Email
	private String signatoryEmail;
}
