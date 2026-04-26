package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.nguyenlong.taskmanager.core.util.EntityBase;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "tbl_nhat_ky_hoat_dong")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogEntity extends EntityBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bang_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private BoardEntity board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "the_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private CardEntity card; // Can be null if board-level activity

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_thuc_hien_id")
    private User actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private User user;

    @Column(name = "loai_hanh_dong", nullable = false)
    private String actionType; // e.g., "CREATE_CARD", "MOVE_CARD", "UPDATE_DESC", "ADD_COMMENT"

    @Column(name = "mo_ta", columnDefinition = "TEXT", nullable = false)
    private String description; // e.g., "moved card from To Do to In Progress"
}
