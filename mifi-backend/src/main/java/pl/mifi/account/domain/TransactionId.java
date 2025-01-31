package pl.mifi.account.domain;

import org.springframework.util.Assert;

import java.util.UUID;

public record TransactionId(UUID id) {

    public TransactionId {
        Assert.notNull(id, "Id must not be null");
    }

    public TransactionId() {
        this(UUID.randomUUID());
    }
}
