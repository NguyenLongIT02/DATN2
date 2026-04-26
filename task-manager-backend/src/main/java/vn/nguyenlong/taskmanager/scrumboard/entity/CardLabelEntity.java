package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tbl_the_nhan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(CardLabelId.class)
public class CardLabelEntity {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "the_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private CardEntity card;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_id", nullable = false)
    private LabelEntity label;
}
