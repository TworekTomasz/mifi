package pl.mifi.budget.application;

import org.springframework.stereotype.Component;
import pl.mifi.budget.domain.Budget;
import pl.mifi.budget.infrastructure.BudgetRepository;
import pl.mifi.cqrs.QueryHandler;

@Component
public class GetByMonthQueryHandler implements QueryHandler<GetByMonthQuery, Budget> {

    private BudgetRepository budgetRepository;

    public GetByMonthQueryHandler(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @Override
    public Budget handle(GetByMonthQuery query) {

        return budgetRepository.findMonthly(query.ym())
                .orElseThrow(() -> new IllegalArgumentException("No budget for month: " + query.ym()));
    }

}
