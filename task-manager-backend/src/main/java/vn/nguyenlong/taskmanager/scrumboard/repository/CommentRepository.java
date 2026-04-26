package vn.nguyenlong.taskmanager.scrumboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.scrumboard.entity.CommentEntity;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    
    @Query("SELECT c FROM CommentEntity c JOIN FETCH c.user WHERE c.card.id = :cardId ORDER BY c.createdAt ASC")
    List<CommentEntity> findByCardIdWithUserOrderByCreatedAtAsc(@Param("cardId") Long cardId);

    @Modifying
    @Query("DELETE FROM CommentEntity c WHERE c.card.id = :cardId")
    void deleteByCardId(@Param("cardId") Long cardId);

    @Modifying
    @Query("DELETE FROM CommentEntity c WHERE c.card.id IN (SELECT cd.id FROM CardEntity cd WHERE cd.list.board.id = :boardId)")
    void deleteByBoardId(@Param("boardId") Long boardId);
}
