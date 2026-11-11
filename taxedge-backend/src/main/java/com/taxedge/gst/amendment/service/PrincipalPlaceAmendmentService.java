package com.taxedge.gst.amendment.service;

import com.taxedge.gst.amendment.dto.PrincipalPlaceAmendmentViewDto;
import com.taxedge.gst.registration.enums.NatureOfPremises;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface PrincipalPlaceAmendmentService {
    
    PrincipalPlaceAmendmentViewDto getExistingPrincipalPlaceDetails(String gstId);

    PrincipalPlaceAmendmentViewDto submitAmendment(String gstId, String customerId, String address, String city, String district,
                                                   String state, String pinCode, NatureOfPremises natureOfPremises,
                                                   MultipartFile file) throws IOException;

    PrincipalPlaceAmendmentViewDto getAmendmentById(String id);

    PrincipalPlaceAmendmentViewDto updateAmendment(String id, String address, String city, String district,
                                                   String state, String pinCode, NatureOfPremises natureOfPremises,
                                                   MultipartFile file) throws IOException;

    String submitAmendment(String id, String gstId, String pushToken);
}
