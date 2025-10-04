package pl.mifi.buget.domain;

import jakarta.persistence.*;
import lombok.*;
import pl.mifi.domain.seed_work.BaseEntity;

import java.math.BigDecimal;

@Getter
@Entity
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // required by JPA
@AllArgsConstructor
public class Envelope extends BaseEntity {

    @Column(name = "limit_amount")
    private BigDecimal limit;

    @Column(name = "spent_amount")
    private BigDecimal spent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnvelopeType type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id")
    private Budget budget;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    public BigDecimal setLimit(BigDecimal limit) {
        return this.limit = limit;
    }

    public BigDecimal spendMoney(BigDecimal amount) {
        return this.spent.subtract(amount);
    }
}
