package pl.mifi.buget.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.mifi.buget.application.CreateBudgetCommandHandler;
import pl.mifi.cqrs.Mediator;

@RestController
@RequestMapping("/budget")
public class BudgetController {

    private Mediator mediator;

    public BudgetController(Mediator mediator) {
        this.mediator = mediator;
    }

    public ResponseEntity<?> createBudget(@RequestBody CreateBudgetCommandHandler.CreateBudgetCommand command) {
        mediator.send(command);
        return ResponseEntity.ok().build();
    }
}
