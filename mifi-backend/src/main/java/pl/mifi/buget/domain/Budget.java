package pl.mifi.buget.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import pl.mifi.domain.seed_work.BaseAggregateRoot;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@Builder
public class Budget extends BaseAggregateRoot {

    private String title;

    private Type type;

    @ElementCollection
    @CollectionTable(name = "budget_incomes", joinColumns = @JoinColumn(name = "budget_id"))
    @Builder.Default
    private List<Income> incomes;

    @ElementCollection
    @CollectionTable(name = "budget_fixed_expenses", joinColumns = @JoinColumn(name = "budget_id"))
    @Builder.Default
    private List<FixedExpense> fixedExpenses;

    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Envelope> envelopes = new HashSet<>();

    public void addEnvelope(Category category, BigDecimal limit) {
        envelopes.add(Envelope.builder().budget(this).category(category).limit(limit).spent(BigDecimal.ZERO).build());
    }

}
