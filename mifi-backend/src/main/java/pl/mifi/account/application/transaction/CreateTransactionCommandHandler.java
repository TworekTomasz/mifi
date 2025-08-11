package pl.mifi.account.application.transaction;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.mifi.account.application.transaction.response.CreateTransactionResponse;
import pl.mifi.account.domain.Transaction;
import pl.mifi.account.infrastruture.TransactionRepository;
import pl.mifi.cqrs.CommandHandler;

@Component
@Transactional
public class CreateTransactionCommandHandler implements CommandHandler<CreateTransactionCommand, CreateTransactionResponse> {

    private final TransactionRepository transactionRepository;

    public CreateTransactionCommandHandler(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @PostConstruct
    public void init() {
        System.out.println("CreateTransactionCommandHandler initialized");
    }
    @Override
    public CreateTransactionResponse handle(CreateTransactionCommand command) {
        Transaction transaction = new Transaction(
                command.amount(),
                command.type(),
                command.category(),
                command.accountId(),
                command.date(),
                command.description(),
                command.title()
        );
        transactionRepository.save(transaction);
        System.out.println("Creating transaction for: " + command.description());
        return new CreateTransactionResponse("1");
    }
}
