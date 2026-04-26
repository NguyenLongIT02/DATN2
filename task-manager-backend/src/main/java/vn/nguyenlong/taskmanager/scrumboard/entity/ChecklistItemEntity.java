package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.*;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

@Entity
@Table(name = "tbl_muc_kiem_tra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItemEntity extends EntityBase {

    @Column(name = "tieu_de", nullable = false)
    private String title;

    @Column(name = "da_hoan_thanh", nullable = false)
    private boolean checked = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "the_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private CardEntity card;
}
