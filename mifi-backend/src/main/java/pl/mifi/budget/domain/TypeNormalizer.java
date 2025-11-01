package pl.mifi.budget.domain;

import java.time.LocalDate;
import java.time.YearMonth;

public final class TypeNormalizer {
    public static Norm normalize(Type type, LocalDate start, LocalDate end) {
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
