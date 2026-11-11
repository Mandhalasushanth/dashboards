package com.taxedge.dashboards.camanagers.gst.dto;

import java.time.LocalDate;

import com.taxedge.customer.enums.CustomerType;
import com.taxedge.customer.enums.Gender;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailsDto {

    private String customerId;
    private String name;
    private String email;
    private String mobileNumber;
    private String pan;
    private String aadhaar;
    private LocalDate dob;
    private Gender gender;
    private CustomerType customerType;
    private String address;
    private String city;
    private String state;
    private String pincode;
}

