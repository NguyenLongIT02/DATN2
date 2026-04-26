package vn.nguyenlong.taskmanager.scrumboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<CardEntity, Long> {

    @Query("SELECT c FROM CardEntity c LEFT JOIN FETCH c.members cm LEFT JOIN FETCH cm.user " +
           "WHERE c.id = :id")
    Optional<CardEntity> findByIdWithMembers(@Param("id") Long id);
    
    @Query("SELECT c FROM CardEntity c LEFT JOIN FETCH c.labels cl LEFT JOIN FETCH cl.label " +
           "WHERE c.id = :id")
    Optional<CardEntity> findByIdWithLabels(@Param("id") Long id);
    
    @Query("SELECT c FROM CardEntity c LEFT JOIN FETCH c.attachments " +
           "WHERE c.id = :id")
    Optional<CardEntity> findByIdWithAttachments(@Param("id") Long id);
    
    @Query("SELECT c FROM CardEntity c LEFT JOIN FETCH c.comments " +
           "WHERE c.id = :id")
    Optional<CardEntity> findByIdWithComments(@Param("id") Long id);
    
    @Query("SELECT c FROM CardEntity c LEFT JOIN FETCH c.list l LEFT JOIN FETCH l.board b " +
           "WHERE c.id = :id")
    Optional<CardEntity> findByIdWithListAndBoard(@Param("id") Long id);

    List<CardEntity> findByListIdOrderByCreatedAt(Long listId);

    @Query("SELECT c FROM CardEntity c LEFT JOIN FETCH c.members cm LEFT JOIN FETCH cm.user " +
           "WHERE c.list.id = :listId ORDER BY c.createdAt")
    List<CardEntity> findByListIdWithMembers(@Param("listId") Long listId);

    @Query("SELECT c FROM CardEntity c JOIN c.members cm WHERE cm.user.id = :userId")
    List<CardEntity> findByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT c FROM CardEntity c " +
           "LEFT JOIN FETCH c.list l " +
           "LEFT JOIN FETCH c.members cm " +
           "LEFT JOIN FETCH cm.user " +
           "WHERE l.board.id = :boardId")
    List<CardEntity> findByBoardIdWithMembers(@Param("boardId") Long boardId);

    @Query("SELECT DISTINCT c FROM CardEntity c " +
           "LEFT JOIN FETCH c.labels cl " +
           "LEFT JOIN FETCH cl.label " +
           "WHERE c.list.board.id = :boardId")
    List<CardEntity> findByBoardIdWithLabels(@Param("boardId") Long boardId);

    @Query("SELECT DISTINCT c FROM CardEntity c " +
           "LEFT JOIN FETCH c.comments cmt " +
           "LEFT JOIN FETCH cmt.user " +
           "WHERE c.list.board.id = :boardId")
    List<CardEntity> findByBoardIdWithComments(@Param("boardId") Long boardId);

    @Query("SELECT DISTINCT c FROM CardEntity c " +
           "LEFT JOIN FETCH c.checklistItems cli " +
           "WHERE c.list.board.id = :boardId")
    List<CardEntity> findByBoardIdWithChecklists(@Param("boardId") Long boardId);

    @Query("SELECT c FROM CardEntity c WHERE c.list.id = :listId ORDER BY c.createdAt")
    List<CardEntity> findByListId(@Param("listId") Long listId);

    @Query("SELECT DISTINCT c FROM CardEntity c " +
           "JOIN FETCH c.list l " +
           "JOIN FETCH l.board b " +
           "LEFT JOIN FETCH c.members m " +
           "LEFT JOIN FETCH m.user u " +
           "WHERE c.date IS NOT NULL " +
           "AND c.date < :now " +
           "AND LOWER(l.name) NOT LIKE '%done%' " +
           "AND LOWER(l.name) NOT LIKE '%hoàn thành%' " +
           "AND LOWER(l.name) NOT LIKE '%xong%'")
    List<CardEntity> findOverdueCards(@Param("now") java.time.Instant now);

    @Modifying
    @Query("DELETE FROM CardEntity c WHERE c.list.board.id = :boardId")
    void deleteByBoardId(@Param("boardId") Long boardId);

    @Modifying
    @Query("DELETE FROM CardEntity c WHERE c.list.id = :listId")
    void deleteByListId(@Param("listId") Long listId);
}
