package vn.nguyenlong.taskmanager.scrumboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.scrumboard.entity.ListEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListRepository extends JpaRepository<ListEntity, Long> {

       @Query("SELECT l FROM ListEntity l JOIN FETCH l.board WHERE l.id = :id")
       Optional<ListEntity> findByIdWithBoard(@Param("id") Long id);

    @Query("SELECT l FROM ListEntity l LEFT JOIN FETCH l.cards c " +
           "LEFT JOIN FETCH c.members cm LEFT JOIN FETCH cm.user " +
           "LEFT JOIN FETCH c.labels cl LEFT JOIN FETCH cl.label " +
           "LEFT JOIN FETCH c.attachments " +
           "WHERE l.id = :id")
    Optional<ListEntity> findByIdWithDetails(@Param("id") Long id);

    List<ListEntity> findByBoardIdOrderByCreatedAt(Long boardId);

    @Query("SELECT l FROM ListEntity l LEFT JOIN FETCH l.cards c " +
           "WHERE l.board.id = :boardId ORDER BY l.createdAt")
    List<ListEntity> findByBoardIdWithCards(@Param("boardId") Long boardId);
    
    @Query("SELECT l FROM ListEntity l LEFT JOIN FETCH l.cards " +
           "WHERE l.id IN :listIds ORDER BY l.createdAt")
    List<ListEntity> findByIdsWithCards(@Param("listIds") List<Long> listIds);

    boolean existsByNameAndBoardId(String name, Long boardId);

    @Modifying
    @Query("DELETE FROM ListEntity l WHERE l.board.id = :boardId")
    void deleteByBoardId(@Param("boardId") Long boardId);
}
