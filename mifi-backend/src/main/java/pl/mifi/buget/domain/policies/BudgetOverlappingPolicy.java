package pl.mifi.buget.domain.policies;

import pl.mifi.buget.domain.Budget;

public interface BudgetOverlappingPolicy {
    boolean conflictsWith(Budget existing, Budget newBudget);
}
