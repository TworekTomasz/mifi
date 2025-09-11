package pl.mifi.account.api.endpoint;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.mifi.account.application.transaction.CreateTransactionCommand;
import pl.mifi.account.application.transaction.GetAllTransactionQuery;
import pl.mifi.account.application.transaction.response.CreateTransactionResponse;
import pl.mifi.account.domain.Transaction;
import pl.mifi.cqrs.Mediator;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    private final Mediator mediator;

    public TransactionController(Mediator mediator) {
        this.mediator = mediator;
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions() {
        return ResponseEntity.ok(mediator.get(new GetAllTransactionQuery()));
    }

    @PostMapping
    public ResponseEntity<CreateTransactionResponse> createTransaction(@RequestBody CreateTransactionCommand createTransactionCommand) {
        mediator.send(createTransactionCommand);
        return ResponseEntity.created(URI.create("/transactions")).build();
    }
}