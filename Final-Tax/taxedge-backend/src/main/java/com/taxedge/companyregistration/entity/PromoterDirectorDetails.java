package com.taxedge.companyregistration.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "promoter_director_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoterDirectorDetails {

	@Id
	@Column(name = "promoter_director_id", nullable = false, unique = true, length = 50)
	private String promoterDirectorId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_registration_id", nullable = false)
	private CompanyDetails companyDetails;

	@Column(name = "full_name", nullable = false, length = 150)
	private String fullName;

	@Column(name = "pan_number", nullable = false, length = 10)
	private String panNumber;

	@Column(name = "date_of_birth", nullable = false)
	private LocalDate dateOfBirth;

	@Column(name = "designation", nullable = false, length = 100)
	private String designation;

	@Column(name = "email_address", nullable = false, length = 100)
	private String emailAddress;

	@Column(name = "mobile_number", nullable = false, length = 20)
	private String mobileNumber;

	@Column(name = "din", length = 8)
	private String din;

	@Column(name = "relationship", length = 100)
	private String relationship;

	@Column(name = "aadhaar_number", length = 12)
	private String aadhaarNumber;
}