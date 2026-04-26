package vn.nguyenlong.taskmanager.scrumboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardRoleEntity;

import java.util.Optional;

@Repository
public interface BoardRoleRepository extends JpaRepository<BoardRoleEntity, Long> {
    Optional<BoardRoleEntity> findById(Long id);
    
    /**
     * Tìm role theo boardId và name
     */
    Optional<BoardRoleEntity> findByBoardIdAndName(Long boardId, String name);
    
    /**
     * Tìm default role của board
     */
    Optional<BoardRoleEntity> findByBoardIdAndIsDefaultTrue(Long boardId);

    @Modifying
    @Query("DELETE FROM BoardRoleEntity br WHERE br.board.id = :boardId")
    void deleteByBoardId(@Param("boardId") Long boardId);
}


