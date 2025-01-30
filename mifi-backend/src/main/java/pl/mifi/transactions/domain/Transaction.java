package pl.mifi.transactions.domain;

import java.util.Date;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;

@Entity
public class Transaction {

    @EmbeddedId
    private TransactionId id;
    private Money amount;
    private Type type;
    private Category category;
    private Account account;
    //TODO: Check what is the best option here for date candidate
    private Date date;
    private String description;

    public Transaction(TransactionId id, Money amount, Type type, Category category, Account account, Date date, String description) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.account = account;
        this.date = date;
        this.description = description;
    }
}
