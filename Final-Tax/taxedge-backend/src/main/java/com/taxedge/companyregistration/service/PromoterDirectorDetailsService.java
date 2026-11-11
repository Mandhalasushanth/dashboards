package com.taxedge.companyregistration.service;

import java.util.List;

import com.taxedge.companyregistration.dto.PromoterDirectorDetailsDto;

public interface PromoterDirectorDetailsService {

	List<String> registerPromoterDirectorDetails(List<PromoterDirectorDetailsDto> dtoList);

	List<PromoterDirectorDetailsDto> getAllPromoterDirectorDetails(String companyRegistrationId);

	PromoterDirectorDetailsDto getPromoterDirectorDetails(String promoterDirectorId);

	String updatePromoterDirectorDetails(String promoterDirectorId, PromoterDirectorDetailsDto dto);

	String deletePromoterDirectorDetails(String promoterDirectorId);
}