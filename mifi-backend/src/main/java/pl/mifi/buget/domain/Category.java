package pl.mifi.buget.domain;

import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import pl.mifi.domain.seed_work.BaseEntity;

@Entity
@NoArgsConstructor
public class Category extends BaseEntity {

    private String name;

    public Category(String name) {
        this.name = name;
    }
}
