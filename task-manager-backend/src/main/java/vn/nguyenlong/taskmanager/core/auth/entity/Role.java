package vn.nguyenlong.taskmanager.core.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import vn.nguyenlong.taskmanager.core.auth.enums.RoleType;
import vn.nguyenlong.taskmanager.core.util.EntityBase;

@Getter
@Setter
@Entity
@Table(name = "tbl_vai_tro")
public class Role extends EntityBase implements GrantedAuthority {

    @Column(name = "ten", nullable = false, unique = true, length = 50)
    @Enumerated(EnumType.STRING)
    private RoleType name;

    @Override
    public String getAuthority() {
        return "ROLE_" + name;
    }
}
