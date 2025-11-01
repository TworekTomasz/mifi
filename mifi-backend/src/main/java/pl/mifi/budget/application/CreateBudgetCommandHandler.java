package pl.mifi.budget.application;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.mifi.budget.application.services.BudgetUniquenessService;
import pl.mifi.budget.domain.*;
import pl.mifi.budget.infrastructure.BudgetRepository;
import pl.mifi.budget.infrastructure.CategoryRepository;
import pl.mifi.cqrs.Command;
import pl.mifi.cqrs.CommandHandler;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
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
    @Transactional
    public void handle(CreateBudgetCommand command) {

        Norm norm = TypeNormalizer.normalize(command.type(), command.start(), command.end());

        Set<Envelope> envelopes = new HashSet<>();
        for (CreateEnvelopeRequest req : command.envelopes()) {
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found: " + req.categoryId()));
            envelopes.add(Envelope.builder().limit(req.limit).category(category).build());
        }

        var existingOpt = budgetRepository.findByTypeAndPeriod(
                command.type(), norm.start(), norm.end());

        if (existingOpt.isPresent()) {
            // UPDATE in place
            var b = existingOpt.get();
            b.rename(command.title());
            b.replaceIncomes(command.incomes());
            b.replaceFixedExpenses(command.fixedExpenses());
            b.replaceEnvelopes(envelopes);
            // JPA will flush on commit
            System.out.println("Updated existing budget for " + norm.start());
        } else {
            // CREATE new
            var b = Budget.create(
                    command.type(),
                    command.title(),
                    command.start(),
                    command.end(),
                    command.incomes(),
                    command.fixedExpenses()
            );
            // add envelopes via domain API
            for (var s : envelopes) {
                b.addEnvelope(s.getCategory(), s.getLimit(), s.getType());
            }
            budgetRepository.save(b);
            System.out.println("Created new budget for " + norm.start());
        }

    }

    public record CreateBudgetCommand(String title, Type type, LocalDate start,
                                      LocalDate end,
                                      List<Income> incomes,
                                      List<FixedExpense> fixedExpenses,
                                      Set<CreateEnvelopeRequest> envelopes) implements Command {
    }


    public record CreateEnvelopeRequest(BigDecimal limit, String categoryId, EnvelopeType type) {
        @Override
        public BigDecimal limit() {
            return limit;
        }

        public Envelope toEnvelope(BigDecimal limit, Category category, EnvelopeType type) {
            return Envelope.builder().limit(limit).spent(BigDecimal.ZERO).category(category).type(type).build();
        }

        public static Set<Envelope> toEnvelopes(Set<CreateEnvelopeRequest> requests, List<Category> categories) {
            Set<Envelope> envelopes = requests.stream().map(request -> {
                Category category = categories.stream()
                        .filter(cat -> cat.getId().toString().equals(request.categoryId()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Category with id " + request.categoryId() + " does not exist"));
                return request.toEnvelope(request.limit(), category, request.type());
            }).collect(java.util.stream.Collectors.toSet());
            return envelopes;
        }
    }
}
