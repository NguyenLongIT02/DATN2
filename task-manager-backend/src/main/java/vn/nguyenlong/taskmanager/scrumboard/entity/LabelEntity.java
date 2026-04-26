package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tbl_nhan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabelEntity extends EntityBase {

    @Column(name = "ten", nullable = false)
    private String name;

    @Column(name = "mau_sac", nullable = false)
    private String color;

    @OneToMany(mappedBy = "label", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CardLabelEntity> cardLabels = new ArrayList<>();
}
