package vn.nguyenlong.taskmanager.core.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.core.auth.entity.Role;
import vn.nguyenlong.taskmanager.core.auth.entity.UserRole;

import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    @Query("SELECT r FROM Role r " +
           "JOIN UserRole ur ON ur.roleId = r.id " +
           "WHERE ur.userId = :userId")
    Set<Role> findRolesByUserId(Long userId);

    Optional<UserRole> findByUserIdAndRoleId(Long userId, Long roleId);

    void deleteByUserId(Long userId);
}
