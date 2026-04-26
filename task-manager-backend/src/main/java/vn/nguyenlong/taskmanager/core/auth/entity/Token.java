package vn.nguyenlong.taskmanager.core.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbl_ma_xac_thuc")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_refresh_token_uuid", nullable = false, unique = true)
    private String refreshTokenUuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private User user;

    @Column(name = "loai_thiet_bi", length = 50)
    private String deviceType;

    @Column(name = "ma_thiet_bi", nullable = false)
    private String deviceId;

    @Column(name = "da_thu_hoi", nullable = false)
    @Builder.Default
    private boolean revoked = false;

    @Column(name = "da_het_han", nullable = false)
    @Builder.Default
    private boolean expired = false;

    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "ngay_het_han", nullable = false)
    private Instant expiresAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
