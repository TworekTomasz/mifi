package pl.mifi.buget.application;

import org.springframework.stereotype.Component;
import pl.mifi.buget.domain.*;
import pl.mifi.buget.infrastructure.BudgetRepository;
import pl.mifi.buget.infrastructure.CategoryRepository;
import pl.mifi.cqrs.Command;
import pl.mifi.cqrs.CommandHandler;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Component
public class CreateBudgetCommandHandler implements CommandHandler<CreateBudgetCommandHandler.CreateBudgetCommand> {

    private final BudgetRepository budgetRepository;

    private final CategoryRepository categoryRepository;

    public CreateBudgetCommandHandler(BudgetRepository budgetRepository, CategoryRepository categoryRepository) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void handle(CreateBudgetCommand command) {

        Budget budget = Budget.builder()
                .title(command.title())
                .type(command.type())
                .incomes(command.incomes())
                .fixedExpenses(command.fixedExpenses())
                .build();

        for (CreateEnvelopeRequest request : command.envelopes()) {
            Category category = categoryRepository.findById(request.categoryId()).orElseThrow(
                    () -> new IllegalArgumentException("Category with id " + request.categoryId() + " does not exist")
            );
            budget.addEnvelope(category,request.limit());
        }

        budgetRepository.save(budget);
    }

    public record CreateBudgetCommand(String title, Type type, List<Income> incomes,
                                      List<FixedExpense> fixedExpenses,
                                      Set<CreateEnvelopeRequest> envelopes) implements Command {
    }

    public record CreateEnvelopeRequest(BigDecimal limit, String categoryId) {
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
