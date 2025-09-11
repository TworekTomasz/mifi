package pl.mifi.buget.application;

import pl.mifi.cqrs.Command;
import pl.mifi.cqrs.CommandHandler;

public class CreateBudgetCommandHandler implements CommandHandler<CreateBudgetCommandHandler.CreateBudgetCommand> {


    @Override
    public void handle(CreateBudgetCommand command) {
        // Implementation for creating a budget goes here
    }

    public record CreateBudgetCommand(String title) implements Command {
    }
}
