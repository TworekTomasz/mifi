package pl.mifi.buget.application;

import pl.mifi.buget.domain.Budget;
import pl.mifi.cqrs.Command;

public record UpdateDefaultTemplateFromBudgetCommand(Budget incoming) implements Command {}
