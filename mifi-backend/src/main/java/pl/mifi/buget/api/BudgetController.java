package pl.mifi.buget.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.mifi.buget.application.CreateBudgetCommandHandler;
import pl.mifi.cqrs.Mediator;

@RestController
@RequestMapping("/budget")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    private Mediator mediator;

    public BudgetController(Mediator mediator) {
        this.mediator = mediator;
    }

    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody CreateBudgetCommandHandler.CreateBudgetCommand command) {
        mediator.send(command);
        return ResponseEntity.ok().build();
    }
}
