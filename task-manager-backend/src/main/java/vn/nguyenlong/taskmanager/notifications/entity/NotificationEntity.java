package vn.nguyenlong.taskmanager.notifications.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.nguyenlong.taskmanager.core.util.EntityBase;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "tbl_thong_bao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEntity extends EntityBase {

    @Column(name = "loai", nullable = false)
    private String type;

    @Column(name = "tieu_de", nullable = false)
    private String title;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "TEXT")
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bang_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private BoardEntity board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "the_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private CardEntity card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_thuc_hien_id", nullable = false)
    private User actor;

    @Column(name = "da_doc")
    private Boolean isRead;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;
}
