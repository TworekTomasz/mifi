package pl.mifi.buget.application;

import org.springframework.stereotype.Component;
import pl.mifi.buget.domain.Budget;
import pl.mifi.buget.infrastructure.BudgetRepository;
import pl.mifi.cqrs.QueryHandler;

@Component
public class GetDefaultBudgetQueryHandler implements QueryHandler<GetDefaultBudgetQuery, Budget> {

    private final BudgetRepository budgetRepository;

    public GetDefaultBudgetQueryHandler(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @Override
    public Budget handle(GetDefaultBudgetQuery query) {
        return budgetRepository.findByIsDefaultTemplateTrue()
                .orElse(null);
    }
}
