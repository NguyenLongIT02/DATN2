package vn.nguyenlong.taskmanager.scrumboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.scrumboard.entity.TaskDependencyEntity;

import java.util.List;

@Repository
public interface TaskDependencyRepository extends JpaRepository<TaskDependencyEntity, Long> {

    @Query("SELECT td FROM TaskDependencyEntity td " +
           "JOIN FETCH td.predecessor p " +
           "JOIN FETCH p.list pl " +
           "WHERE td.successor.id = :successorId")
    List<TaskDependencyEntity> findBySuccessorIdWithPredecessorAndList(@Param("successorId") Long successorId);

    // Find all dependencies for a card (predecessors)
    List<TaskDependencyEntity> findBySuccessorId(Long successorId);

    // Find specific dependency
    @Query("SELECT td FROM TaskDependencyEntity td " +
           "WHERE td.successor.id = :successorId AND td.predecessor.id = :predecessorId")
    TaskDependencyEntity findBySuccessorIdAndPredecessorId(
        @Param("successorId") Long successorId,
        @Param("predecessorId") Long predecessorId
    );

    @Query("SELECT d FROM TaskDependencyEntity d " +
           "LEFT JOIN FETCH d.predecessor " +
           "WHERE d.successor.id IN :successorIds")
    List<TaskDependencyEntity> findBySuccessorIdIn(@Param("successorIds") List<Long> successorIds);

    @Modifying
    @Query("DELETE FROM TaskDependencyEntity td WHERE td.predecessor.id = :cardId OR td.successor.id = :cardId")
    void deleteByCardId(@Param("cardId") Long cardId);

    @Modifying
    @Query("DELETE FROM TaskDependencyEntity td " +
           "WHERE td.predecessor.id IN (SELECT c.id FROM CardEntity c WHERE c.list.board.id = :boardId) " +
           "   OR td.successor.id IN (SELECT c.id FROM CardEntity c WHERE c.list.board.id = :boardId)")
    void deleteByBoardId(@Param("boardId") Long boardId);
}
