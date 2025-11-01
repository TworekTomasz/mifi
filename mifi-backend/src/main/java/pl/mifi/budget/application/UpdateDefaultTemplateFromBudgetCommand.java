package pl.mifi.budget.application;

import pl.mifi.budget.domain.Budget;
import pl.mifi.cqrs.Command;

public record UpdateDefaultTemplateFromBudgetCommand(Budget incoming) implements Command {}
