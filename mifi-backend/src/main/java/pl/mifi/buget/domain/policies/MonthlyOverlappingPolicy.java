package pl.mifi.buget.domain.policies;

import pl.mifi.buget.domain.Budget;
import pl.mifi.buget.domain.Type;

import java.time.YearMonth;

public class MonthlyOverlappingPolicy implements BudgetOverlappingPolicy {

    @Override
    public boolean conflictsWith(Budget existing, Budget newBudget) {
        return YearMonth.from(existing.getPeriodStart()).equals(YearMonth.from(newBudget.getPeriodStart()));
    }
}
