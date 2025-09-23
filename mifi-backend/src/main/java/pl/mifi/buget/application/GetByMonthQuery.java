package pl.mifi.buget.application;

import pl.mifi.cqrs.Query;

import java.time.YearMonth;

public record GetByMonthQuery(YearMonth ym) implements Query {
}
