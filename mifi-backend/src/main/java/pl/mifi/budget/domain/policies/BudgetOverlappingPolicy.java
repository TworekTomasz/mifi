package pl.mifi.budget.domain.policies;

import pl.mifi.budget.domain.Budget;

public interface BudgetOverlappingPolicy {
    boolean conflictsWith(Budget existing, Budget newBudget);
}
