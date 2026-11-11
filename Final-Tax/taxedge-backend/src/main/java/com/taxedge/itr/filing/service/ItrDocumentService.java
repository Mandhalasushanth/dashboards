package com.taxedge.itr.filing.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.filing.dto.DocumentDto;

public interface ItrDocumentService {

	String registerDocuments(String itrId, MultipartFile form16PartAPartB, MultipartFile form26as, MultipartFile aisTis,
			MultipartFile bankAccountStatement, MultipartFile salaryPayslips,
			MultipartFile capitalGainsStatement, MultipartFile businessTurnover) throws IOException;

	DocumentDto getDocuments(String documentId);

	String updateDocuments(String documentId, MultipartFile form16PartAPartB, MultipartFile form26as,
			MultipartFile aisTis, MultipartFile bankAccountStatement, MultipartFile salaryPayslips,
			MultipartFile capitalGainsStatement, MultipartFile businessTurnover) throws IOException;

	String deleteDocuments(String documentId);
}
