package vn.nguyenlong.taskmanager.scrumboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardListDto {
    private Long id;
    private String name;
    private String statusType; // Changed from ListStatusType to String for JSON serialization
    private List<CardDto> cards;
}
