
package com.taxedge.companyregistration.service;

import java.io.IOException;

import com.taxedge.companyregistration.dto.DocumentsKycChecklistDto;

public interface DocumentsKycChecklistService {

	String uploadDocuments(String companyRegistrationId, DocumentsKycChecklistDto dto) throws IOException;

	DocumentsKycChecklistDto getDocumentsById(String documentId);

	String updateDocumentsById(String documentId, DocumentsKycChecklistDto dto) throws IOException;

	String deleteDocumentsById(String documentId);
}
