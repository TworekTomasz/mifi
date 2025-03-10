package pl.mifi.account.application.transaction;

import org.springframework.stereotype.Component;
import pl.mifi.account.domain.Transaction;
import pl.mifi.account.infrastruture.TransactionRepository;

import java.util.List;

@Component
public class GetAllTransactionQueryHandler {
    private final TransactionRepository transactionRepository;

    public GetAllTransactionQueryHandler(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> handle() {
        return transactionRepository.findAll();
    }
}
