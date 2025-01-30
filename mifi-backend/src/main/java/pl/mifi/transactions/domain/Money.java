package pl.mifi.transactions.domain;

import java.math.BigDecimal;

public record Money(BigDecimal amount, Currency currency) {
}
