package pl.mifi.budget.application.services;

import pl.mifi.budget.domain.Budget;

public interface BudgetUniquenessService {
    boolean hasConflict(Budget newBudget);
}

