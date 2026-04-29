package vn.nguyenlong.taskmanager.scrumboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.service.FileStorageService;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.AttachmentDto;
import vn.nguyenlong.taskmanager.scrumboard.service.AttachmentService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("${api.prefix}/scrumboard/attachments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Attachment Controller", description = "API endpoints for card attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final FileStorageService fileStorageService;

    @PostMapping("/upload/{cardId}")
    @Operation(summary = "Upload attachment to card")
    public SuccessResponse<AttachmentDto> uploadAttachment(
            @PathVariable Long cardId,
            @RequestParam("file") MultipartFile file) {
        AttachmentDto dto = attachmentService.uploadAttachment(cardId, file);
        return ResponseUtil.ok(HttpStatus.CREATED.value(), "File uploaded successfully", dto);
    }

    @DeleteMapping("/{attachmentId}")
    @Operation(summary = "Delete an attachment")
    public SuccessResponse<String> deleteAttachment(@PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseUtil.ok(HttpStatus.OK.value(), "Attachment deleted successfully", "Deleted");
    }

    @GetMapping("/download/{fileName:.+}")
    @Operation(summary = "Download an attachment")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (Exception ex) {
            log.info("Could not determine file type.");
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
