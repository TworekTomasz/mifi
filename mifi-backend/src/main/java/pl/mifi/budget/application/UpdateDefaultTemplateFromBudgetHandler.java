package pl.mifi.budget.application;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.mifi.budget.domain.Budget;
import pl.mifi.budget.infrastructure.BudgetRepository;
import pl.mifi.cqrs.CommandHandler;

import java.util.ArrayList;

@Component
@Transactional
public class UpdateDefaultTemplateFromBudgetHandler
        implements CommandHandler<UpdateDefaultTemplateFromBudgetCommand> {

    private final BudgetRepository budgetRepo;

    public UpdateDefaultTemplateFromBudgetHandler(BudgetRepository budgetRepo) {
        this.budgetRepo = budgetRepo;
    }

    @Override
    public void handle(UpdateDefaultTemplateFromBudgetCommand c) {
        var in = c.incoming();

        // 1) znajdź istniejący szablon albo utwórz nowy
        var template = budgetRepo.findByIsDefaultTemplateTrue()
                .orElseGet(() -> {
                    var t = new Budget();
                    t.setIsDefaultTemplate(true);
                    return t;
                });

        // 2) pełny replace prostą kopią pól (BEZ walidacji)
        template.setTitle(in.getTitle());
        template.setIncomes(new ArrayList<>(in.getIncomes()));
        template.setFixedExpenses(new ArrayList<>(in.getFixedExpenses()));

        // okres i typ nie są częścią szablonu
        template.setType(null);
        template.setPeriodStart(null);
        template.setPeriodEnd(null);

        // kopia kopert: limit tak jak z frontu, spent zerujemy
        template.getEnvelopes().clear();
        if (in.getEnvelopes() != null) {
            for (var e : in.getEnvelopes()) {
                template.addEnvelope(e.getCategory(), e.getLimit(), e.getType()); // addEnvelope ustawia spent=0
            }
        }

        budgetRepo.save(template);
    }
}
