package vn.nguyenlong.taskmanager.scrumboard.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.*;
import vn.nguyenlong.taskmanager.scrumboard.entity.*;
import vn.nguyenlong.taskmanager.core.auth.entity.User;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ScrumboardMapper {

    // Board mappings
    @Mapping(target = "list", source = "lists")
    @Mapping(target = "startDate", source = "startDate", qualifiedByName = "instantToString")
    @Mapping(target = "endDate", source = "endDate", qualifiedByName = "instantToString")
    BoardDto toBoardDto(BoardEntity board);

    List<BoardDto> toBoardDtoList(List<BoardEntity> boards);

    // List mappings
    @Mapping(target = "cards", source = "cards", qualifiedByName = "cardSetToList")
    CardListDto toCardListDto(ListEntity list);

    List<CardListDto> toCardListDtoList(List<ListEntity> lists);

    // Card mappings
    @Mapping(target = "desc", source = "description")
    @Mapping(target = "date", source = "date", qualifiedByName = "instantToString")
    @Mapping(target = "laneId", source = "list.id")
    @Mapping(target = "label", source = "labels", qualifiedByName = "cardLabelsToLabelDtos")
    @Mapping(target = "members", source = "members", qualifiedByName = "cardMembersToMemberDtos")
    @Mapping(target = "attachments", source = "attachments")
    @Mapping(target = "comments", source = "comments", qualifiedByName = "commentsToCommentDtos")
    @Mapping(target = "checkedList", source = "checklistItems")
    CardDto toCardDto(CardEntity card);

    List<CardDto> toCardDtoList(List<CardEntity> cards);

    // Checklist mappings
    ChecklistDto toChecklistDto(ChecklistItemEntity entity);

    List<ChecklistDto> toChecklistDtoList(List<ChecklistItemEntity> entities);

    // Member mappings
    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "name", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "avatar", source = "user.profileImageUrl")
    @Mapping(target = "role", source = "boardRole.name")
    @Mapping(target = "joinedAt", source = "joinedAt", qualifiedByName = "instantToString")
    @Mapping(target = "lastActive", source = "updatedAt", qualifiedByName = "instantToString")
    @Mapping(target = "boards", source = "user", qualifiedByName = "getBoardCount")
    @Mapping(target = "tasks", source = "user", qualifiedByName = "getTaskCount")
    MemberDto toMemberDto(BoardMemberEntity boardMember);

    List<MemberDto> toMemberDtoList(List<BoardMemberEntity> boardMembers);

    // Label mappings
    @Mapping(target = "type", constant = "1")
    LabelDto toLabelDto(LabelEntity label);

    List<LabelDto> toLabelDtoList(List<LabelEntity> labels);

    // Attachment mappings
    @Mapping(target = "file.path", source = "filePath")
    @Mapping(target = "file.name", source = "fileName")
    @Mapping(target = "file.lastModified", source = "fileLastModified")
    @Mapping(target = "file.lastModifiedDate", source = "fileLastModifiedDate")
    AttachmentDto toAttachmentDto(AttachmentEntity attachment);

    List<AttachmentDto> toAttachmentDtoList(List<AttachmentEntity> attachments);


    // Named methods for complex mappings
    @Named("instantToString")
    default String instantToString(Instant instant) {
        if (instant == null) return null;
        return instant.toString();
    }

    @Named("cardLabelsToLabelDtos")
    default List<LabelDto> cardLabelsToLabelDtos(List<CardLabelEntity> cardLabels) {
        if (cardLabels == null) return List.of();
        return cardLabels.stream()
                .map(CardLabelEntity::getLabel)
                .map(this::toLabelDto)
                .toList();
    }

    @Named("cardMembersToMemberDtos")
    default List<MemberDto> cardMembersToMemberDtos(List<CardMemberEntity> cardMembers) {
        if (cardMembers == null) return List.of();
        return cardMembers.stream()
                .map(cardMember -> {
                    MemberDto memberDto = new MemberDto();
                    memberDto.setId(cardMember.getUser().getId());
                    memberDto.setName(cardMember.getUser().getFullName());
                    memberDto.setEmail(cardMember.getUser().getEmail());
                    memberDto.setAvatar(cardMember.getUser().getProfileImageUrl());
                    return memberDto;
                })
                .toList();
    }

    @Named("commentsToCommentDtos")
    default List<CommentDto> commentsToCommentDtos(List<CommentEntity> comments) {
        if (comments == null) return List.of();
        return comments.stream()
                .map(entity -> {
                    CommentDto dto = new CommentDto();
                    dto.setId(entity.getId());
                    dto.setCardId(entity.getCard().getId());
                    dto.setContent(entity.getContent());
                    if (entity.getUser() != null) {
                        dto.setUserId(entity.getUser().getId());
                        dto.setUsername(entity.getUser().getUsername());
                        dto.setUserFullName(entity.getUser().getFullName());
                        dto.setUserAvatar(entity.getUser().getProfileImageUrl());
                    }
                    dto.setCreatedAt(entity.getCreatedAt());
                    return dto;
                })
                .toList();
    }


    @Named("getBoardCount")
    default Integer getBoardCount(User user) {
        // This would need to be calculated in service layer
        return 0;
    }

    @Named("getTaskCount")
    default Integer getTaskCount(User user) {
        // This would need to be calculated in service layer using CardMemberRepository.countByUserId
        return 0;
    }

    @Named("cardSetToList")
    default List<CardDto> cardSetToList(Set<CardEntity> cards) {
        if (cards == null) return List.of();
        return cards.stream()
                .map(this::toCardDto)
                .collect(Collectors.toList());
    }
}
