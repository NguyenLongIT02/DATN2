package vn.nguyenlong.taskmanager.scrumboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.scrumboard.entity.ChecklistItemEntity;

import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItemEntity, Long> {
    List<ChecklistItemEntity> findByCardId(Long cardId);
    @Modifying
    @Query("DELETE FROM ChecklistItemEntity ci WHERE ci.card.id = :cardId")
    void deleteByCardId(@Param("cardId") Long cardId);

    @Modifying
    @Query("DELETE FROM ChecklistItemEntity ci WHERE ci.card.id IN (SELECT c.id FROM CardEntity c WHERE c.list.board.id = :boardId)")
    void deleteByBoardId(@Param("boardId") Long boardId);
}
