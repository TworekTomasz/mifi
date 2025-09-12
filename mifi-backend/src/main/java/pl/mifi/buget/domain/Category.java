package pl.mifi.buget.domain;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import pl.mifi.domain.seed_work.BaseEntity;

@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseEntity {

    private String name;

    private String description;

}
