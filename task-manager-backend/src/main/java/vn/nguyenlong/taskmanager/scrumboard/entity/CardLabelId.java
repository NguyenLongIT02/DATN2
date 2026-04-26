package vn.nguyenlong.taskmanager.scrumboard.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardLabelId implements Serializable {

    private Long card;
    private Long label;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CardLabelId that = (CardLabelId) o;
        return card.equals(that.card) && label.equals(that.label);
    }

    @Override
    public int hashCode() {
        return card.hashCode() + label.hashCode();
    }
}
