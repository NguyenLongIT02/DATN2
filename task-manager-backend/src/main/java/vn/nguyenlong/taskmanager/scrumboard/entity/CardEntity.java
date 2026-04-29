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
@Table(name = "tbl_the_cong_viec")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardEntity extends EntityBase {

    @Column(name = "tieu_de", nullable = false)
    private String title;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String description;

    @Column(name = "ngay_het_han")
    private Instant date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cot_id")
    private ListEntity list;

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CardMemberEntity> members = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CardLabelEntity> labels = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AttachmentEntity> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CommentEntity> comments = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChecklistItemEntity> checklistItems = new ArrayList<>();

    // Dependencies: tasks that this card depends on (predecessors)
    @OneToMany(mappedBy = "successor", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<TaskDependencyEntity> dependencies = new ArrayList<>();

}
