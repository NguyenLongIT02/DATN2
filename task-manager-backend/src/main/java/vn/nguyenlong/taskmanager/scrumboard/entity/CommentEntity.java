package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.nguyenlong.taskmanager.core.util.EntityBase;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "tbl_binh_luan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentEntity extends EntityBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "the_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private CardEntity card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private vn.nguyenlong.taskmanager.core.auth.entity.User user;

    @Column(name = "noi_dung", columnDefinition = "TEXT", nullable = false)
    private String content;
}
