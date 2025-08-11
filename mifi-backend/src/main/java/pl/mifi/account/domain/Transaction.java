package pl.mifi.account.domain;

import jakarta.persistence.Entity;
import pl.mifi.domain.seed_work.BaseEntity;

import java.math.BigDecimal;
import java.util.Date;

@Entity
public class Transaction extends BaseEntity {

    public Transaction() {
    }

    private String title;
    private BigDecimal amount;
    private String type;
    private String category;
    private String account;
    //TODO: Check what is the best option here for date candidate
    private Date date;
    private String description;

    public Transaction(BigDecimal amount, String type, String category, String account, Date date, String description,
                       String title) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.account = account;
        this.date = date;
        this.description = description;
        this.title = title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getType() {
        return type;
    }

    public String getCategory() {
        return category;
    }

    public String getAccount() {
        return account;
    }

    public Date getDate() {
        return date;
    }

    public String getDescription() {
        return description;
    }

    public String getTitle() {
        return title;
    }
}
