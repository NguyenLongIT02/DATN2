package vn.nguyenlong.taskmanager.notifications.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.notifications.entity.NotificationEntity;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    @Query("SELECT n FROM NotificationEntity n LEFT JOIN FETCH n.actor a " +
           "WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    Page<NotificationEntity> findByUserIdWithActor(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT n FROM NotificationEntity n LEFT JOIN FETCH n.actor a " +
           "WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<NotificationEntity> findUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE n.user.id = :userId AND n.isRead = false")
    Long countUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT n FROM NotificationEntity n LEFT JOIN FETCH n.actor a " +
           "WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    List<NotificationEntity> findByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);

       @Modifying
       @Query("DELETE FROM NotificationEntity n WHERE n.user.id = :userId")
       void deleteAllByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM NotificationEntity n WHERE n.card.id = :cardId")
    void deleteByCardId(@Param("cardId") Long cardId);

    @Modifying
    @Query("DELETE FROM NotificationEntity n WHERE n.board.id = :boardId OR n.card.id IN (SELECT c.id FROM CardEntity c WHERE c.list.board.id = :boardId)")
    void deleteByBoardId(@Param("boardId") Long boardId);

    boolean existsByUserIdAndCardIdAndType(Long userId, Long cardId, String type);
}
