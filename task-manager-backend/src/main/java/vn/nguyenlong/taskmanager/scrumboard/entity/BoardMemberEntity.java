package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.nguyenlong.taskmanager.core.util.EntityBase;
import vn.nguyenlong.taskmanager.core.auth.entity.User;

import java.time.Instant;

@Entity
@Table(name = "tbl_thanh_vien_bang")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardMemberEntity extends EntityBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bang_id", nullable = false)
    private BoardEntity board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vai_tro_id")
    private BoardRoleEntity boardRole;

    @Column(name = "trang_thai", length = 20)
    @Builder.Default
    private String status = "active";

    @Column(name = "ngay_gia_nhap")
    private Instant joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_moi_id")
    private User invitedBy;
}
