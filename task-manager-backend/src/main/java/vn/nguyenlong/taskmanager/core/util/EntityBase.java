package vn.nguyenlong.taskmanager.core.util;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class EntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "ngay_cap_nhat", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "nguoi_tao", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "nguoi_cap_nhat")
    private String updatedBy;
}
