package pl.mifi.domain.seed_work;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue
    private Long entityId;

    public Long getEntityId() {
        return entityId;
    }

}
