package pl.mifi.account.application.transaction;

import pl.mifi.account.domain.Bank;
import pl.mifi.cqrs.Command;
import pl.mifi.cqrs.CommandHandler;

import java.math.BigDecimal;
import java.util.Date;

public record CreateTransactionCommand(BigDecimal amount, String type, String category, String accountId, Date date,
                                       String description, String title, Bank bank) implements Command {
}

