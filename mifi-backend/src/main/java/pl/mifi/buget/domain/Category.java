package pl.mifi.buget.domain;

import jakarta.persistence.Entity;
import pl.mifi.domain.seed_work.BaseEntity;

@Entity
public class Category extends BaseEntity {

    private String name;

    public Category(String name) {
        this.name = name;
    }
}
