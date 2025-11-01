package pl.mifi.budget.domain;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;


@Embeddable
@Getter @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class FixedExpense {
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String description;

    private LocalDate dueDate;

}