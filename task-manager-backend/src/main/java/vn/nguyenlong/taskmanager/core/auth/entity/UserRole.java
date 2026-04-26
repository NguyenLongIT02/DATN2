package vn.nguyenlong.taskmanager.core.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbl_nguoi_dung_vai_tro")
public class UserRole extends EntityBase {

    @Column(name = "nguoi_dung_id", nullable = false)
    private Long userId;

    @Column(name = "vai_tro_id", nullable = false)
    private Long roleId;
}
