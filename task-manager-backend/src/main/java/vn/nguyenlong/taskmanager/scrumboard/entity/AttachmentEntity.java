package vn.nguyenlong.taskmanager.scrumboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

@Entity
@Table(name = "tbl_tep_dinh_kem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentEntity extends EntityBase {

    @Column(name = "duong_dan_tep", nullable = false)
    private String filePath;

    @Column(name = "ten_tep", nullable = false)
    private String fileName;

    @Column(name = "ngay_chinh_sua_cuoi", nullable = false)
    private Long fileLastModified;

    @Column(name = "ngay_chinh_sua_cuoi_chuoi", nullable = false)
    private String fileLastModifiedDate;

    @Column(name = "xem_truoc", nullable = false)
    private String preview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "the_id", nullable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private CardEntity card;
}
