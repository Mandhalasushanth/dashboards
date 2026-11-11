package com.taxedge.gst.amendment.service;

import com.taxedge.gst.amendment.dto.LegalNameAmendmentViewDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface LegalNameAmendmentService {

    LegalNameAmendmentViewDto getExistingLegalNameDetails(String gstId);

    LegalNameAmendmentViewDto submitLegalNameAmendment(String gstId, String customerId, String newLegalName, MultipartFile file) throws IOException;

    LegalNameAmendmentViewDto getAmendmentById(String id);

    LegalNameAmendmentViewDto updateLegalNameAmendment(String id, String newLegalName, MultipartFile file) throws IOException;

    String submitAmendment(String id, String gstId, String pushToken);
}
