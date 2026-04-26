package vn.nguyenlong.taskmanager.core.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import vn.nguyenlong.taskmanager.core.auth.enums.AccountStatus;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_nguoi_dung")
public class User extends EntityBase implements UserDetails {

    @Column(name = "ten_dang_nhap", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "mat_khau", nullable = false)
    private String password;

    @Column(name = "ho_ten", length = 100)
    private String fullName;

    @Column(name = "anh_dai_dien", columnDefinition = "TEXT")
    private String profileImageUrl;

    @Column(name = "da_xac_minh", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private AccountStatus status;

    @Transient
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(role -> (GrantedAuthority) role)
                .toList();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != AccountStatus.LOCK;
    }

    @Override
    public boolean isEnabled() {
        return status == AccountStatus.ACTIVE && Boolean.TRUE.equals(isVerified);
    }
}
