package pl.mifi.buget.application.services;

import pl.mifi.buget.domain.Budget;

public interface BudgetUniquenessService {
    void assertNoConflict(Budget newBudget);
}

