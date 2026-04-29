package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tbl_cot_cong_viec")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ListEntity extends EntityBase {

    @Column(name = "ten", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_type")
    private ListStatusType statusType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bang_id", nullable = false)
    private BoardEntity board;

    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<CardEntity> cards = new HashSet<>();
}
