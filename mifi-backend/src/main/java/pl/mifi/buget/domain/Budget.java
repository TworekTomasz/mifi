package pl.mifi.buget.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import pl.mifi.domain.seed_work.BaseAggregateRoot;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Budget extends BaseAggregateRoot {

    private String title;

    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL)
    private final Set<Envelope> envelopes = new HashSet<>();

}
