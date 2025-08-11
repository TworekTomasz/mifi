package pl.mifi.account.infrastruture.csv;

import pl.mifi.account.domain.Transaction;

import java.io.InputStream;
import java.util.List;

public interface CsvTransactionReader {

    List<Transaction> read();
}
