package pl.mifi.buget.application.services;

import pl.mifi.buget.domain.Budget;

public interface BudgetUniquenessService {
    boolean hasConflict(Budget newBudget);
}

