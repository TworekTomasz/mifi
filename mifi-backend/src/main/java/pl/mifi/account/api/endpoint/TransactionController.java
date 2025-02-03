package pl.mifi.account.api.endpoint;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.mifi.account.application.transaction.CreateTransactionCommand;
import pl.mifi.account.application.transaction.response.CreateTransactionResponse;
import pl.mifi.cqrs.Mediator;

import java.net.URI;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final Mediator mediator;

    public TransactionController(Mediator mediator) {
        this.mediator = mediator;
    }

    @PostMapping
    public ResponseEntity<CreateTransactionResponse> createTransaction(@RequestBody CreateTransactionCommand createTransactionCommand) {
        CreateTransactionResponse response = mediator.send(createTransactionCommand);
        return ResponseEntity
                .created(URI.create("/transactions/" + response.id()))
                .body(response);
    }
}