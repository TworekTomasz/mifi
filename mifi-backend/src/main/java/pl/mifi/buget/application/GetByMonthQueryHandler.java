package pl.mifi.buget.application;

import org.springframework.stereotype.Component;
import pl.mifi.buget.domain.Budget;
import pl.mifi.buget.infrastructure.BudgetRepository;
import pl.mifi.cqrs.Query;
import pl.mifi.cqrs.QueryHandler;

import java.time.YearMonth;
import java.util.Objects;

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
