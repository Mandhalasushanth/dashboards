package com.taxedge.companyregistration.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
public class RegisteredOfficeDetailsDto {

	private String registeredOfficeId;

	private String companyRegistrationId;

	@NotBlank(message = "Building/premises address is required")
	private String buildingPremisesAddressLine;

	@NotBlank(message = "City is required")
	private String city;

	@NotBlank(message = "District is required")
	private String district;

	@NotBlank(message = "State is required")
	private String state;

	@NotBlank(message = "PIN code is required")
	@Pattern(regexp = "^[0-9]{6}$", message = "PIN code must contain exactly 6 digits")
	private String pinCode;

	@NotBlank(message = "Premises ownership is required")
	private String premisesOwnership;

	@NotBlank(message = "Company email is required")
	@Email(message = "Please enter a valid email address")
	private String companyEmail;

	@NotBlank(message = "Mobile number is required")
	@Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must contain exactly 10 digits")
	private String mobileNumber;
}