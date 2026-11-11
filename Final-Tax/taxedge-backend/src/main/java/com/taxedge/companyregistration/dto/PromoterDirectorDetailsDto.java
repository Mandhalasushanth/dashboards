package com.taxedge.companyregistration.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoterDirectorDetailsDto {

	private String promoterDirectorId;

	private String companyRegistrationId;

	@NotBlank(message = "Full name is required")
	private String fullName;

	@NotBlank(message = "PAN number is required")
	@Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Enter a valid PAN number")
	private String panNumber;

	@NotNull(message = "Date of birth is required")
	@Past(message = "Date of birth must be in the past")
	private LocalDate dateOfBirth;

	@NotBlank(message = "Designation is required")
	private String designation;

	@NotBlank(message = "Email address is required")
	@Email(message = "Enter a valid email address")
	private String emailAddress;

	@NotBlank(message = "Mobile number is required")
	@Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must contain exactly 10 digits")
	private String mobileNumber;

	private String din;

	private String relationship;

	@Pattern(regexp = "^[0-9]{12}$", message = "Aadhaar number must contain exactly 12 digits")
	private String aadhaarNumber;
}