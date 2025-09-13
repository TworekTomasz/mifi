package pl.mifi.buget.application;

import org.springframework.stereotype.Component;
import pl.mifi.buget.application.services.BudgetUniquenessService;
import pl.mifi.buget.domain.*;
import pl.mifi.buget.infrastructure.BudgetRepository;
import pl.mifi.buget.infrastructure.CategoryRepository;
import pl.mifi.cqrs.Command;
import pl.mifi.cqrs.CommandHandler;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class CreateBudgetCommandHandler implements CommandHandler<CreateBudgetCommandHandler.CreateBudgetCommand> {

    private final BudgetRepository budgetRepository;

    private final CategoryRepository categoryRepository;

    private final BudgetUniquenessService uniquenessService;

    public CreateBudgetCommandHandler(BudgetRepository budgetRepository, CategoryRepository categoryRepository, BudgetUniquenessService uniquenessService) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.uniquenessService = uniquenessService;
    }

    @Override
    public void handle(CreateBudgetCommand command) {

        List<Envelope> envelopes = new ArrayList<>();
        for (CreateEnvelopeRequest req : command.envelopes()) {
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found: " + req.categoryId()));
            envelopes.add(Envelope.builder().limit(req.limit).category(category).build());
        }

        Budget budget = Budget.create(
                command.type(),
                command.title(),
                command.start(),
                command.end(),
                command.incomes(),
                command.fixedExpenses(),
                uniquenessService
        );

        envelopes.forEach(env -> budget.addEnvelope(env.getCategory(), env.getLimit()));

        budgetRepository.save(budget);
    }

    public record CreateBudgetCommand(String title, Type type, LocalDate start,
                                      LocalDate end,
                                      List<Income> incomes,
                                      List<FixedExpense> fixedExpenses,
                                      Set<CreateEnvelopeRequest> envelopes) implements Command {
    }


    public record CreateEnvelopeRequest(BigDecimal limit, String categoryId) {
        @Override
        public BigDecimal limit() {
            return limit;
        }

        public Envelope toEnvelope(BigDecimal limit, Category category) {
            return Envelope.builder().limit(limit).spent(BigDecimal.ZERO).category(category).build();
        }

        public static Set<Envelope> toEnvelopes(Set<CreateEnvelopeRequest> requests, List<Category> categories) {
            Set<Envelope> envelopes = requests.stream().map(request -> {
                Category category = categories.stream()
                        .filter(cat -> cat.getId().toString().equals(request.categoryId()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Category with id " + request.categoryId() + " does not exist"));
                return request.toEnvelope(request.limit(), category);
            }).collect(java.util.stream.Collectors.toSet());
            return envelopes;
        }
    }
}
