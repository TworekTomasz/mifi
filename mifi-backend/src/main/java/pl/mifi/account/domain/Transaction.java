package pl.mifi.account.domain;

import jakarta.persistence.Entity;
import pl.mifi.domain.seed_work.BaseEntity;

import java.math.BigDecimal;
import java.util.Date;

@Entity
public class Transaction extends BaseEntity {

    public Transaction() {
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    private String title;
    private BigDecimal amount;
    private String type;
    private String category;
    private String account;
    //TODO: Check what is the best option here for date candidate
    private Date date;
    private String description;

    private Bank bank;

    public void setBank(Bank bank) {
        this.bank = bank;
    }

    public Transaction(BigDecimal amount, String type, String category, String account, Date date, String description,
                       String title, Bank bank) {
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.account = account;
        this.date = date;
        this.description = description;
        this.title = title;
        this.bank = bank;
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

    public Bank getBank() {
        return bank;
    }

    public String getDescription() {
        return description;
    }

    public String getTitle() {
        return title;
    }
}
