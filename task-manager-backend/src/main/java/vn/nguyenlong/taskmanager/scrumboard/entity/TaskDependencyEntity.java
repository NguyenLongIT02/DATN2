package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

@Entity
@Table(name = "tbl_phu_thuoc_cong_viec")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskDependencyEntity extends EntityBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "predecessor_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private CardEntity predecessor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "successor_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private CardEntity successor;
}
