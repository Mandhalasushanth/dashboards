package com.taxedge.validator;

import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class GstFileUploadValidator {

	private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

	private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("application/pdf", "image/jpeg", "image/png",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel");

	public void validate(MultipartFile file, String documentType) {

		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("File is required for " + documentType);
		}

		if (file.getSize() > MAX_FILE_SIZE) {
			throw new IllegalArgumentException("File size cannot exceed 10 MB for " + documentType);
		}

		String fileName = file.getOriginalFilename();

		if (fileName == null || fileName.isBlank()) {
			throw new IllegalArgumentException("File name is required for " + documentType);
		}

		String contentType = file.getContentType();

		if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.trim().toLowerCase(Locale.ROOT))) {

			throw new IllegalArgumentException("Unsupported file type for " + documentType);
		}

		validateFileContent(file, contentType);
	}

	private void validateFileContent(MultipartFile file, String contentType) {

		try {
			byte[] content = file.getBytes();

			if (content.length == 0) {
				throw new IllegalArgumentException("File content cannot be empty");
			}

			String normalizedType = contentType.trim().toLowerCase(Locale.ROOT);

			if ("application/pdf".equals(normalizedType)) {
				validatePdf(content);
			}

			if ("image/jpeg".equals(normalizedType)) {
				validateJpeg(content);
			}

			if ("image/png".equals(normalizedType)) {
				validatePng(content);
			}

		} catch (IllegalArgumentException exception) {
			throw exception;
		} catch (Exception exception) {
			throw new IllegalArgumentException("Unable to validate file content");
		}
	}

	private void validatePdf(byte[] content) {

		if (content.length < 5 || content[0] != '%' || content[1] != 'P' || content[2] != 'D' || content[3] != 'F'
				|| content[4] != '-') {

			throw new IllegalArgumentException("Invalid PDF file content");
		}
	}

	private void validateJpeg(byte[] content) {

		if (content.length < 3 || (content[0] & 0xFF) != 0xFF || (content[1] & 0xFF) != 0xD8
				|| (content[2] & 0xFF) != 0xFF) {

			throw new IllegalArgumentException("Invalid JPEG file content");
		}
	}

	private void validatePng(byte[] content) {

		if (content.length < 8 || (content[0] & 0xFF) != 0x89 || content[1] != 0x50 || content[2] != 0x4E
				|| content[3] != 0x47 || content[4] != 0x0D || content[5] != 0x0A || content[6] != 0x1A
				|| content[7] != 0x0A) {

			throw new IllegalArgumentException("Invalid PNG file content");
		}
	}
}
