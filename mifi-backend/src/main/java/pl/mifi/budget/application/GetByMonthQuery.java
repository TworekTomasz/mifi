package pl.mifi.budget.application;

import pl.mifi.cqrs.Query;

import java.time.YearMonth;

public record GetByMonthQuery(YearMonth ym) implements Query {
}
