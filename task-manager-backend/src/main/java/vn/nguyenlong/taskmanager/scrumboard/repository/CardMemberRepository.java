package vn.nguyenlong.taskmanager.scrumboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardMemberEntity;

import java.util.List;

@Repository
public interface CardMemberRepository extends JpaRepository<CardMemberEntity, Long> {

    @Query("SELECT cm FROM CardMemberEntity cm LEFT JOIN FETCH cm.user u WHERE cm.card.id = :cardId")
    List<CardMemberEntity> findByCardIdWithUser(@Param("cardId") Long cardId);

    List<CardMemberEntity> findByCardId(Long cardId);

    List<CardMemberEntity> findByUserId(Long userId);

    long countByCardId(Long cardId);

    boolean existsByCardIdAndUserId(Long cardId, Long userId);

    @Modifying
    @Query("DELETE FROM CardMemberEntity cm WHERE cm.card.id = :cardId")
    void deleteByCardId(@Param("cardId") Long cardId);

    @Modifying
    @Query("DELETE FROM CardMemberEntity cm WHERE cm.card.id = :cardId AND cm.user.id = :userId")
    void deleteByCardIdAndUserId(@Param("cardId") Long cardId, @Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM CardMemberEntity cm WHERE cm.card.id IN (SELECT c.id FROM CardEntity c WHERE c.list.board.id = :boardId)")
    void deleteByBoardId(@Param("boardId") Long boardId);
}
