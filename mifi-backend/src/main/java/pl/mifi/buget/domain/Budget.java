package pl.mifi.buget.domain;

import jakarta.persistence.*;
import lombok.*;
import pl.mifi.buget.application.services.BudgetUniquenessService;
import pl.mifi.domain.seed_work.BaseAggregateRoot;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Budget extends BaseAggregateRoot {

    private String title;

    private Type type;

    private LocalDate periodStart;

    private LocalDate periodEnd;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "budget_incomes", joinColumns = @JoinColumn(name = "budget_id"))
    private List<Income> incomes;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "budget_fixed_expenses", joinColumns = @JoinColumn(name = "budget_id"))
    private List<FixedExpense> fixedExpenses;

    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Envelope> envelopes = new HashSet<>();


    public static Budget create(Type type, String title,
                                LocalDate requestedStart, LocalDate requestedEnd,
                                List<Income> incomes, List<FixedExpense> fixedExpenses) {
        Objects.requireNonNull(type);
        Objects.requireNonNull(title);

        var normalized = TypeNormalizer.normalize(type, requestedStart, requestedEnd);

        var budget = Budget.builder()
                .title(title)
                .type(type)
                .periodStart(normalized.start())
                .periodEnd(normalized.end())
                .incomes(incomes)
                .fixedExpenses(fixedExpenses)
                .build();

        return budget;
    }

    public void addEnvelope(Category category, BigDecimal limit) {
        if (limit.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Limit must be non-negative");
        }
        envelopes.add(Envelope.builder()
                .budget(this)
                .category(category)
                .limit(limit)
                .spent(BigDecimal.ZERO)
                .build());
    }

    public void rename(String newTitle) {
        this.title = newTitle;
    }

    public void replaceFixedExpenses(List<FixedExpense> newItems) {
        this.fixedExpenses.clear();
        if (newItems != null && !newItems.isEmpty()) {
            this.fixedExpenses.addAll(newItems);
        }
    }

    public void replaceIncomes(List<Income> newItems) {
        this.incomes.clear();
        if (newItems != null && !newItems.isEmpty()) {
            this.incomes.addAll(newItems);
        }
    }

    public void replaceEnvelopes(Set<Envelope> newEnvelopes) {
        this.envelopes.clear();
        if (newEnvelopes != null) {
            for (var s : newEnvelopes) {
                addEnvelope(s.getCategory(), s.getLimit());
            }
        }
    }

}
