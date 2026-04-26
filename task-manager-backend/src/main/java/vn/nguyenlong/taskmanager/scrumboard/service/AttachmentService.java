package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.core.service.FileStorageService;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.AttachmentDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.AttachmentEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.AttachmentRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final CardRepository cardRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public AttachmentDto uploadAttachment(Long cardId, MultipartFile file) {
        CardEntity card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + cardId));

        String fileName = fileStorageService.storeFile(file);
        String fileDownloadUrl = fileStorageService.getFileDownloadUrl(fileName);

        AttachmentEntity attachment = new AttachmentEntity();
        attachment.setCard(card);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(fileName);
        attachment.setPreview(fileDownloadUrl);
        attachment.setFileLastModified(System.currentTimeMillis());
        attachment.setFileLastModifiedDate(java.time.LocalDate.now().toString());

        AttachmentEntity saved = attachmentRepository.save(attachment);
        return toDto(saved);
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        AttachmentEntity attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new NotFoundException("Attachment not found with id: " + attachmentId));
        // We could also delete the actual file here, but for simplicity, we just delete the DB record
        attachmentRepository.delete(attachment);
    }

    private AttachmentDto toDto(AttachmentEntity entity) {
        AttachmentDto dto = new AttachmentDto();
        dto.setId(entity.getId());
        dto.setPreview(entity.getPreview());
        
        AttachmentDto.FileInfoDto fileDto = new AttachmentDto.FileInfoDto();
        fileDto.setPath(entity.getFilePath());
        fileDto.setName(entity.getFileName());
        fileDto.setLastModified(entity.getFileLastModified());
        fileDto.setLastModifiedDate(entity.getFileLastModifiedDate());
        
        dto.setFile(fileDto);
        return dto;
    }
}
