package pl.mifi.buget.application;

import org.springframework.stereotype.Component;
import pl.mifi.buget.domain.Category;
import pl.mifi.buget.infrastructure.CategoryRepository;
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
        Category category = new Category(command.name());
        categoryRepository.save(category);
    }

    public record CreateCategoryCommand(String name) implements Command {
    }
}
