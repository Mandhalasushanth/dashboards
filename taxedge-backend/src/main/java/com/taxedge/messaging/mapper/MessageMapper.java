package com.taxedge.messaging.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.taxedge.messaging.dto.MessageDto;
import com.taxedge.messaging.entity.Message;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.WARN)
public interface MessageMapper {

    MessageDto toDto(Message entity);

    List<MessageDto> toDtoList(List<Message> entities);
}