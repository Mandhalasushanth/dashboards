package com.taxedge.customer.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.taxedge.customer.enums.CustomerType;
import com.taxedge.customer.enums.Gender;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @Column(name = "cust_id", length = 50, nullable = false, updatable = false)
    private String custId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;
    
    @Column(name = "mobile_number", length = 20, nullable = false, unique = true)
    private String mobileNumber;

    @Column(name = "adhar", length = 20, unique = true)
    private String aadhaar;

    @Column(name = "pan", length = 20, unique = true)
    private String pan;
    
    @Column(name = "dob")
    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @Column(name = "father_spouse_name", length = 100)
    private String fatherSpouseName;

    @Enumerated(EnumType.STRING)
    @Column(name = "cust_type", length = 50, nullable = false)
    private CustomerType customerType;

    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "push_token", length = 500)
    private String pushToken;
}




