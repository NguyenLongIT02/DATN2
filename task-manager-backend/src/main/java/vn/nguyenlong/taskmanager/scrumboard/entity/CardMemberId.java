package vn.nguyenlong.taskmanager.scrumboard.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardMemberId implements Serializable {

    private Long card;
    private Long user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CardMemberId that = (CardMemberId) o;
        return card.equals(that.card) && user.equals(that.user);
    }

    @Override
    public int hashCode() {
        return card.hashCode() + user.hashCode();
    }
}
