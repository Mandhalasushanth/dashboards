package com.taxedge.gst.amendment.service;

import com.taxedge.gst.amendment.dto.ContactAmendmentViewDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface ContactAmendmentService {
    ContactAmendmentViewDto getExistingContactDetails(String gstId);
    ContactAmendmentViewDto submitContactAmendment(String gstId, String customerId, String mobileNumber, String email, MultipartFile file) throws IOException;

    ContactAmendmentViewDto getAmendmentById(String id);

    ContactAmendmentViewDto updateContactAmendment(String id, String mobileNumber, String email, MultipartFile file) throws IOException;

    String submitAmendment(String id, String gstId, String pushToken);
}
