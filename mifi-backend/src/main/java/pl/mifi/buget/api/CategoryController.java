package pl.mifi.buget.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.mifi.buget.application.CreateCategoryCommandHandler;
import pl.mifi.cqrs.Mediator;

@RestController
@RequestMapping("/budget/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {

    private final Mediator mediator;

    public CategoryController(Mediator mediator) {
        this.mediator = mediator;
    }

    @PostMapping
    public ResponseEntity<Boolean> createCategory(@RequestBody CreateCategoryCommandHandler.CreateCategoryCommand command) {
        Boolean result = mediator.send(command);
        return ResponseEntity.ok(result);
    }
}
