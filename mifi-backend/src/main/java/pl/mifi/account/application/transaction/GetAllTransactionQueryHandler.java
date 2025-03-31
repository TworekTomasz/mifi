package pl.mifi.account.application.transaction;

import org.springframework.stereotype.Component;
import pl.mifi.account.domain.Transaction;
import pl.mifi.account.infrastruture.TransactionRepository;
import pl.mifi.cqrs.QueryHandler;

import java.util.List;

@Component
public class GetAllTransactionQueryHandler implements QueryHandler<GetAllTransactionQuery, List<Transaction>> {
    private final TransactionRepository transactionRepository;

    public GetAllTransactionQueryHandler(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public List<Transaction> handle(GetAllTransactionQuery query) {
        return transactionRepository.findAll();
    }
}
