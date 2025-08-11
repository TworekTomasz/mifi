package pl.mifi.account.infrastruture.csv;

import pl.mifi.account.domain.Transaction;

import java.util.List;

public class MBankTransactionReader implements CsvTransactionReader {

    @Override
    public List<Transaction> read() {
        // Implement the logic to read transactions from mBank CSV files
        // This is a placeholder implementation
        return List.of();
    }
}
