package com.taxedge.companyregistration.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "registered_office_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisteredOfficeDetails {

	@Id
	@Column(name = "registered_office_id", nullable = false, unique = true, length = 50)
	private String registeredOfficeId;

	@OneToOne
	@JoinColumn(name = "company_registration_id", nullable = false)
	private CompanyDetails companyDetails;

	@Column(name = "building_premises_address_line", nullable = false, length = 255)
	private String buildingPremisesAddressLine;

	@Column(name = "city", nullable = false, length = 100)
	private String city;

	@Column(name = "district", nullable = false, length = 100)
	private String district;

	@Column(name = "state", nullable = false, length = 100)
	private String state;

	@Column(name = "pin_code", nullable = false, length = 6)
	private String pinCode;

	@Column(name = "premises_ownership", nullable = false, length = 100)
	private String premisesOwnership;

	@Column(name = "company_email", nullable = false, length = 100)
	private String companyEmail;

	@Column(name = "mobile_number", nullable = false, length = 20)
	private String mobileNumber;
}