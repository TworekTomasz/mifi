package pl.mifi.domain.seed_work;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class BaseAggregateRoot {

    @Id
    @GeneratedValue
    private Long aggregateId;

    public Long getAggregateId() {
        return aggregateId;
    }
}
