package vn.nguyenlong.taskmanager.core.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.core.auth.entity.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findUserByUsernameOrEmail(String username, String email);
    Optional<User> findByEmail(String email);
}
