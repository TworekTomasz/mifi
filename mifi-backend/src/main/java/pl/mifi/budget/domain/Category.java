package pl.mifi.budget.domain;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import pl.mifi.domain.seed_work.BaseEntity;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class Category extends BaseEntity {

    private String name;

    private String description;

}
