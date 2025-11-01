package pl.mifi.budget.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.mifi.budget.application.CreateCategoryCommandHandler;
import pl.mifi.budget.application.GetAllCategoriesQuery;
import pl.mifi.budget.domain.Category;
import pl.mifi.cqrs.Mediator;

import java.util.List;

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
        mediator.send(command);
        return ResponseEntity.ok(true);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Category>> getCategories() {
        List<Category> categories = mediator.get(new GetAllCategoriesQuery());
        return ResponseEntity.ok().body(categories);
    }
}
