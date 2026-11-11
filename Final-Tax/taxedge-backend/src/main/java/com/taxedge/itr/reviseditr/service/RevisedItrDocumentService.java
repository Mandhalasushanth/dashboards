package com.taxedge.itr.reviseditr.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.reviseditr.dto.RevisedItrDocumentDto;

public interface RevisedItrDocumentService {

	String registerDocuments(String revisedItrId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) throws IOException;

	RevisedItrDocumentDto getDocuments(String documentId);

	String updateDocuments(String documentId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) throws IOException;

	String deleteDocuments(String documentId);
}
