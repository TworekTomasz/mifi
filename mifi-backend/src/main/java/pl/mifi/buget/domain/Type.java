package pl.mifi.buget.domain;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Objects;

public enum Type { MONTHLY, YEARLY, FIXED_RANGE, EVENT }

record Norm(LocalDate start, LocalDate end) {}

final class TypeNormalizer {
    static Norm normalize(Type type, LocalDate start, LocalDate end) {
        return switch (type) {
            case MONTHLY -> {
                var ym = YearMonth.from(start);
                yield new Norm(ym.atDay(1), ym.atEndOfMonth());
            }
            case YEARLY -> null;
            case FIXED_RANGE -> null;
            case EVENT -> null;
        };
    }
}