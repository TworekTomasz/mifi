package pl.mifi.transactions.domain;

public interface TransactionRepository {

    Transaction save(Transaction transaction);
}
