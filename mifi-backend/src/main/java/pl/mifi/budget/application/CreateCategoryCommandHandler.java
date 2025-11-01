package pl.mifi.budget.application;

import org.springframework.stereotype.Component;
import pl.mifi.budget.domain.Category;
import pl.mifi.budget.infrastructure.CategoryRepository;
import pl.mifi.cqrs.Command;
import pl.mifi.cqrs.CommandHandler;

@Component
public class CreateCategoryCommandHandler implements CommandHandler<CreateCategoryCommandHandler.CreateCategoryCommand> {

    private final CategoryRepository categoryRepository;

    public CreateCategoryCommandHandler(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void handle(CreateCategoryCommand command) {
        Category category = new Category(command.name(), command.description());
        categoryRepository.save(category);
    }

    public record CreateCategoryCommand(String name, String description) implements Command {
    }
}
