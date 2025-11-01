package pl.mifi.budget.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.mifi.budget.application.CreateBudgetCommandHandler;
import pl.mifi.budget.application.GetByMonthQuery;
import pl.mifi.budget.application.GetDefaultBudgetQuery;
import pl.mifi.budget.application.UpdateDefaultTemplateFromBudgetCommand;
import pl.mifi.budget.domain.Budget;
import pl.mifi.cqrs.Mediator;

import java.time.YearMonth;

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

    @GetMapping("monthly/{ym}")
    public ResponseEntity<Budget> getMonthly(@PathVariable String ym) {
        YearMonth yearMonth = YearMonth.parse(ym); // ISO: YYYY-MM
        Budget dto = mediator.get(new GetByMonthQuery(yearMonth));
        return ResponseEntity.ok()
                .body(dto);
    }

    @GetMapping("default")
    public ResponseEntity<Budget> getDefault() {
        Budget budget = mediator.get(new GetDefaultBudgetQuery());
        return ResponseEntity.ok().body(budget);
    }

    @PutMapping("default")
    public ResponseEntity<?> updateDefault(@RequestBody Budget body) {
        mediator.send(new UpdateDefaultTemplateFromBudgetCommand(body));
        return ResponseEntity.ok().build();
    }
}
