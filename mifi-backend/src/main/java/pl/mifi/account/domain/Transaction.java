package pl.mifi.account.domain;

import java.util.Date;

import jakarta.persistence.Entity;
import pl.mifi.domain.seed_work.BaseEntity;

@Entity
public class Transaction extends BaseEntity {

    private Money amount;
    private Type type;
    private Category category;
    private Account account;
    //TODO: Check what is the best option here for date candidate
    private Date date;
    private String description;

    public Transaction(Money amount, Type type, Category category, Account account, Date date, String description) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.account = account;
        this.date = date;
        this.description = description;
    }
}
