package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tbl_bang_cong_viec")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoardEntity extends EntityBase {

    @Column(name = "ten", nullable = false)
    private String name;

    @Column(name = "ngay_bat_dau")
    private Instant startDate;

    @Column(name = "ngay_ket_thuc")
    private Instant endDate;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ListEntity> lists = new ArrayList<>();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BoardMemberEntity> members = new ArrayList<>();
}
