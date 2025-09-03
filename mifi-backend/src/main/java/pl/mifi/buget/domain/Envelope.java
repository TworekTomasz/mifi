package pl.mifi.buget.domain;

import jakarta.persistence.*;
import pl.mifi.domain.seed_work.BaseEntity;

import java.math.BigDecimal;

@Entity
public class Envelope extends BaseEntity {

    @Column(name = "limit_amount")
    private BigDecimal limit;

    @Column(name = "spent_amount")
    private BigDecimal spent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id")
    private Budget budget;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    public Envelope(BigDecimal limit, BigDecimal spent, Budget budget, Category category) {
        this.limit = limit;
        this.spent = spent;
        this.budget = budget;
        this.category = category;
    }

    public Budget getBudget() {
        return budget;
    }

    public Category getCategory() {
        return category;
    }

    public BigDecimal getLimit() {
        return limit;
    }

    public BigDecimal getSpent() {
        return spent;
    }

    public BigDecimal setLimit(BigDecimal limit) {
        return this.limit = limit;
    }

    public BigDecimal spendMoney(BigDecimal amount) {
        return this.spent.subtract(amount);
    }
}
