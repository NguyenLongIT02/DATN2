package vn.nguyenlong.taskmanager.scrumboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.scrumboard.entity.ActivityLogEntity;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLogEntity, Long> {

    @Query("SELECT a FROM ActivityLogEntity a JOIN FETCH a.user WHERE a.board.id = :boardId ORDER BY a.createdAt DESC")
    List<ActivityLogEntity> findByBoardIdOrderByCreatedAtDesc(@Param("boardId") Long boardId);

    @Query("SELECT a FROM ActivityLogEntity a JOIN FETCH a.user WHERE a.card.id = :cardId ORDER BY a.createdAt DESC")
    List<ActivityLogEntity> findByCardIdOrderByCreatedAtDesc(@Param("cardId") Long cardId);

    @Modifying
    @Query("DELETE FROM ActivityLogEntity a WHERE a.board.id = :boardId")
    void deleteByBoardId(@Param("boardId") Long boardId);

    @Modifying
    @Query("UPDATE ActivityLogEntity a SET a.card = null WHERE a.card.id = :cardId")
    void nullifyCardId(@Param("cardId") Long cardId);
}
