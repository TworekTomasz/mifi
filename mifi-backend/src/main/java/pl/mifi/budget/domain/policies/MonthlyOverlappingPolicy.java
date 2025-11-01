package pl.mifi.budget.domain.policies;

import pl.mifi.budget.domain.Budget;

import java.time.YearMonth;

public class MonthlyOverlappingPolicy implements BudgetOverlappingPolicy {

    @Override
    public boolean conflictsWith(Budget existing, Budget newBudget) {
        return YearMonth.from(existing.getPeriodStart()).equals(YearMonth.from(newBudget.getPeriodStart()));
    }
}
