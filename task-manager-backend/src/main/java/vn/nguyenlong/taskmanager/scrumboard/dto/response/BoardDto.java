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
public class BoardDto {
    private Long id;
    private String name;
    private String startDate;
    private String endDate;
    private List<CardListDto> list;
}
