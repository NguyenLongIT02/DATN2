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
@Table(name = "tbl_vai_tro_bang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardRoleEntity extends EntityBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bang_id", nullable = false)
    private BoardEntity board;

    @Column(name = "ten", nullable = false, length = 50)
    private String name;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String description;

    @Column(name = "mac_dinh")
    private Boolean isDefault;

    @OneToMany(mappedBy = "boardRole", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BoardMemberEntity> members = new ArrayList<>();
}
