package pl.mifi.account.application.transaction;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.mifi.account.application.transaction.response.CreateTransactionResponse;
import pl.mifi.cqrs.CommandHandler;

@Component
@Transactional
public class CreateTransactionCommandHandler implements CommandHandler<CreateTransactionCommand, CreateTransactionResponse> {

    @Override
    public CreateTransactionResponse handle(CreateTransactionCommand command) {
        System.out.println("Creating transaction for: " + command.description());
        return new CreateTransactionResponse("1");
    }
}
