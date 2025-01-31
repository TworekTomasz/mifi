package pl.mifi.account.domain;

import pl.mifi.domain.seed_work.annotations.ValueObject;

import java.math.BigDecimal;

@ValueObject
public record Money(BigDecimal amount, Currency currency) {
}
