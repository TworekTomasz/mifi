package pl.mifi.buget.domain;

import jakarta.persistence.Embeddable;

import java.math.BigDecimal;

@Embeddable
public record Income(BigDecimal amount, String source) {}
