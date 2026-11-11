package com.taxedge.messaging.service;

import java.security.Principal;
import java.util.List;

import com.taxedge.messaging.dto.MessageDto;

public interface MessageService {

    
    MessageDto saveMessage(MessageDto dto, Principal sender);
    
    List<MessageDto> getConversation(String partnerId, int page, int size);
}