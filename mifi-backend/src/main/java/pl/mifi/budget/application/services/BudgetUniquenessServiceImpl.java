package pl.mifi.budget.application.services;

import org.springframework.stereotype.Service;
import pl.mifi.budget.domain.Budget;
import pl.mifi.budget.domain.Type;
import pl.mifi.budget.domain.policies.BudgetOverlappingPolicy;
import pl.mifi.budget.domain.policies.MonthlyOverlappingPolicy;
import pl.mifi.budget.infrastructure.BudgetRepository;

import java.util.List;
import java.util.Map;

@Service
public class BudgetUniquenessServiceImpl implements BudgetUniquenessService {

    private final BudgetRepository budgetRepository;
    private final Map<Type, BudgetOverlappingPolicy> policies;

    public BudgetUniquenessServiceImpl(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
        this.policies = Map.of(
                Type.MONTHLY, new MonthlyOverlappingPolicy()
        );
    }

    @Override
    public boolean hasConflict(Budget newBudget) {
        var policy = policies.get(newBudget.getType());
        List<Budget> budgets = budgetRepository.findAllByType(newBudget.getType());
        return budgets.stream().anyMatch(ex -> policy.conflictsWith(ex, newBudget));
    }
}
