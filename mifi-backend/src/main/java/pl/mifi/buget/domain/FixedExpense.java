package pl.mifi.buget.domain;

import jakarta.persistence.Embeddable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Embeddable
public record FixedExpense(BigDecimal amount, String description, LocalDate dueDate) {}
