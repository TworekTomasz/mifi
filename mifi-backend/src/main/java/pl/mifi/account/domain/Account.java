package pl.mifi.account.domain;

import jakarta.persistence.Entity;
import pl.mifi.domain.seed_work.BaseAggregateRoot;
import pl.mifi.domain.seed_work.annotations.AggregateRoot;

import java.math.BigDecimal;
import java.util.List;

@Entity
@AggregateRoot
public class Account extends BaseAggregateRoot {

    private String accountNumber;
    private BigDecimal balance;

    private List<Transaction> transactions;
}
